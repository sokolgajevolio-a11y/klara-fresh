import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { fetchPowerballDataset } from "../sandras-stuff/powerball/source.server";
import { runLiveTournament } from "../sandras-stuff/powerball/run.server";
import { recommendTickets } from "../sandras-stuff/powerball/recommend.server";
import { rollingHoldoutValidation, weightSensitivityValidation, summarizeRobustness } from "../sandras-stuff/powerball/validation";
import { getForwardLedger, recordForwardPrediction, settleAvailablePredictions } from "../sandras-stuff/powerball/forward-ledger.server";

function assertSandraAccess(session) {
  const allowedShop = (process.env.SANDRAS_STUFF_SHOP || "").trim().toLowerCase();
  if (!allowedShop) throw new Response("Sandra's Stuff is not configured", { status: 503 });
  if ((session.shop || "").trim().toLowerCase() !== allowedShop) throw new Response("Not found", { status: 404 });
}

function verdictFromSummary(summary) {
  if (summary.robustCandidate) return "stable";
  const holdoutRate = summary.holdoutWindows ? summary.holdoutPositive / summary.holdoutWindows : 0;
  const sensitivityRate = summary.sensitivityVariants ? summary.sensitivityPositive / summary.sensitivityVariants : 0;
  if (holdoutRate >= 0.5 || sensitivityRate >= 0.6) return "questionable";
  return "unsupported";
}

function TicketList({ tickets }) {
  return <ol>{tickets.map((ticket, i) => <li key={i}><strong>{ticket.white.join(" · ")}</strong> &nbsp; Powerball <strong>{ticket.powerball}</strong></li>)}</ol>;
}

function nextPowerballDrawDate(latestDrawDate) {
  const d = new Date(`${latestDrawDate}T12:00:00Z`);
  const allowed = new Set([1, 3, 6]);
  do d.setUTCDate(d.getUTCDate() + 1); while (!allowed.has(d.getUTCDay()));
  return d.toISOString().slice(0, 10);
}

async function buildAnalysis(draws) {
  const tournament = await runLiveTournament(draws);
  const holdouts = rollingHoldoutValidation({ draws });
  const sensitivity = weightSensitivityValidation({ draws });
  const robustness = summarizeRobustness({ holdouts, sensitivity });
  const verdict = verdictFromSummary(robustness);
  const recommendation = recommendTickets({ draws, tournament, robustness, count: 5 });
  return { tournament, holdouts, sensitivity, robustness, verdict, recommendation };
}

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  assertSandraAccess(session);
  const draws = await fetchPowerballDataset();
  await settleAvailablePredictions({ shop: session.shop, draws });
  const analysis = await buildAnalysis(draws);
  const ledger = await getForwardLedger({ shop: session.shop });
  const latestDraw = draws.at(-1)?.date || null;
  return Response.json({
    drawCount: draws.length,
    firstDraw: draws[0]?.date || null,
    latestDraw,
    nextDraw: latestDraw ? nextPowerballDrawDate(latestDraw) : null,
    tournament: analysis.tournament,
    recommendation: analysis.recommendation,
    validation: { verdict: analysis.verdict, robustness: analysis.robustness, holdouts: analysis.holdouts, sensitivity: analysis.sensitivity },
    ledger,
  });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  assertSandraAccess(session);
  const form = await request.formData();
  if (form.get("intent") !== "record-next-prediction") return Response.json({ ok: false, error: "Unknown action" }, { status: 400 });

  const draws = await fetchPowerballDataset();
  await settleAvailablePredictions({ shop: session.shop, draws });
  const latestDrawDate = draws.at(-1)?.date;
  if (!latestDrawDate) return Response.json({ ok: false, error: "No historical draw data available" }, { status: 503 });

  const analysis = await buildAnalysis(draws);
  const targetDrawDate = nextPowerballDrawDate(latestDrawDate);
  try {
    await recordForwardPrediction({
      shop: session.shop,
      targetDrawDate,
      latestKnownDrawDate: latestDrawDate,
      recommendation: analysis.recommendation,
    });
    return Response.json({ ok: true, targetDrawDate });
  } catch (error) {
    if (String(error?.code || "") === "P2002") return Response.json({ ok: false, error: `Prediction for ${targetDrawDate} is already frozen.` }, { status: 409 });
    throw error;
  }
}

export default function PowerballResearchPage() {
  const data = useLoaderData();
  const actionData = useActionData();
  const r = data.recommendation;
  const v = data.validation;
  const ledger = data.ledger;
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1>Sandra's Stuff · Powerball Research</h1>
      <p>Private research tool. Historical patterns are evaluated against random selection; no strategy is treated as a guaranteed predictor.</p>
      <p><strong>Current-era draws:</strong> {data.drawCount} · <strong>Range:</strong> {data.firstDraw} to {data.latestDraw}</p>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Forward Test</h2>
        <p><strong>Next scheduled draw:</strong> {data.nextDraw}</p>
        <Form method="post"><input type="hidden" name="intent" value="record-next-prediction" /><button type="submit">Freeze Prediction for Next Draw</button></Form>
        {actionData?.ok && <p>Prediction frozen for <strong>{actionData.targetDrawDate}</strong>.</p>}
        {actionData?.error && <p><strong>{actionData.error}</strong></p>}
        <p>Once the official result enters the dataset, this page automatically settles any pending frozen prediction when opened.</p>
      </section>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Forward Performance</h2>
        <p>Frozen predictions: <strong>{ledger.summary.predictions}</strong> · Settled draws: <strong>{ledger.summary.settledDraws}</strong></p>
        <p>Primary avg white matches: <strong>{ledger.summary.primary.averageWhiteMatches.toFixed(3)}</strong> · Primary PB hit rate: <strong>{(ledger.summary.primary.powerballHitRate * 100).toFixed(2)}%</strong></p>
        <p>Research avg white matches: <strong>{ledger.summary.research.averageWhiteMatches.toFixed(3)}</strong> · Research PB hit rate: <strong>{(ledger.summary.research.powerballHitRate * 100).toFixed(2)}%</strong></p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Target draw</th><th align="left">Strategy</th><th align="left">Status</th></tr></thead><tbody>{ledger.rows.map(row => <tr key={row.id}><td>{row.targetDrawDate}</td><td>{row.selectedStrategy}</td><td>{row.settled ? "settled" : "pending"}</td></tr>)}</tbody></table>
      </section>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Model Robustness</h2>
        <p><strong>Verdict:</strong> {v.verdict}</p>
        <p>Holdout windows positive: <strong>{v.robustness.holdoutPositive}/{v.robustness.holdoutWindows}</strong> · Clear positive 95% CI: <strong>{v.robustness.holdoutCIClear}/{v.robustness.holdoutWindows}</strong> · Weight variants positive: <strong>{v.robustness.sensitivityPositive}/{v.robustness.sensitivityVariants}</strong></p>
        <p>{v.verdict === "stable" ? "The ensemble survives the current holdout and sensitivity thresholds. This is still experimental evidence, not proof of lottery predictability." : v.verdict === "questionable" ? "Some validation tests are positive, but the evidence is not stable enough to claim an edge." : "The ensemble does not currently survive robustness testing. Treat its apparent patterns as unsupported."}</p>
        <h3>Rolling holdouts</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Holdout</th><th align="right">Advantage</th><th align="right">95% CI</th></tr></thead><tbody>{v.holdouts.map((row, i) => <tr key={i}><td>{row.holdoutStartIndex}–{row.holdoutEndIndex}</td><td align="right">{row.comparison.advantage.toFixed(4)}</td><td align="right">[{row.comparison.approximate95CI.map(x => x.toFixed(4)).join(", ")}]</td></tr>)}</tbody></table>
        <h3>Weight sensitivity</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Variant</th><th align="right">Advantage</th><th align="right">95% CI</th></tr></thead><tbody>{v.sensitivity.map(row => <tr key={row.name}><td>{row.name}</td><td align="right">{row.comparison.advantage.toFixed(4)}</td><td align="right">[{row.comparison.approximate95CI.map(x => x.toFixed(4)).join(", ")}]</td></tr>)}</tbody></table>
      </section>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Primary Candidate Tickets</h2>
        <p><strong>Status:</strong> {r.evidenceStatus === "robust-candidate-edge" ? "Robust experimental candidate" : "No robust demonstrated edge"}</p>
        <p><strong>Selected method:</strong> {r.selectedStrategy}</p><p>{r.explanation}</p><TicketList tickets={r.tickets} />
      </section>

      {r.researchTickets?.length > 0 && <section style={{ marginTop: 28, padding: 20, border: "1px dashed #999", borderRadius: 12 }}><h2>Research-Only Ensemble Tickets</h2><p><strong>Do not interpret these as having a demonstrated predictive advantage.</strong> They are shown separately for future comparison.</p><TicketList tickets={r.researchTickets} /></section>}

      {data.tournament.map(windowResult => <section key={windowResult.warmup} style={{ marginTop: 28 }}><h2>Warmup {windowResult.warmup}</h2><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Strategy</th><th align="right">Advantage</th><th align="right">95% CI</th><th align="right">Avg white matches</th><th align="right">PB hit rate</th></tr></thead><tbody>{windowResult.ranking.map(row => <tr key={row.name}><td>{row.name}</td><td align="right">{row.comparison.advantage.toFixed(4)}</td><td align="right">[{row.comparison.approximate95CI.map(v => v.toFixed(4)).join(", ")}]</td><td align="right">{row.result.averageWhiteMatches.toFixed(4)}</td><td align="right">{(row.result.powerballHitRate * 100).toFixed(2)}%</td></tr>)}</tbody></table></section>)}
    </div>
  );
}
