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

function nextPowerballDrawDate(latestDrawDate) {
  const d = new Date(`${latestDrawDate}T12:00:00Z`);
  const allowed = new Set([1, 3, 6]);
  do d.setUTCDate(d.getUTCDate() + 1); while (!allowed.has(d.getUTCDay()));
  return d.toISOString().slice(0, 10);
}

function TicketList({ tickets }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {tickets.map((ticket, i) => (
        <div key={i} style={{ padding: "12px 14px", border: "1px solid #ddd", borderRadius: 10, fontSize: 18 }}>
          <strong>{ticket.white.join("  ·  ")}</strong>
          <span style={{ marginLeft: 18 }}>Powerball <strong>{ticket.powerball}</strong></span>
        </div>
      ))}
    </div>
  );
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
    await recordForwardPrediction({ shop: session.shop, targetDrawDate, latestKnownDrawDate: latestDrawDate, recommendation: analysis.recommendation });
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

  const card = { marginTop: 22, padding: 20, border: "1px solid #ddd", borderRadius: 14 };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h1>Powerball</h1>
      <p style={{ maxWidth: 760 }}>Sandra's private Powerball research tool. It tests historical patterns, separates experimental picks from baseline picks, and records predictions before drawings so future performance cannot be rewritten afterward.</p>

      <section style={card}>
        <h2>Next Draw</h2>
        <p><strong>{data.nextDraw}</strong></p>
        <p>Latest result in the dataset: {data.latestDraw}</p>
        <Form method="post">
          <input type="hidden" name="intent" value="record-next-prediction" />
          <button type="submit" style={{ padding: "10px 16px", fontWeight: 600 }}>Freeze These Picks for the Next Draw</button>
        </Form>
        {actionData?.ok && <p><strong>Saved.</strong> These picks are permanently frozen for {actionData.targetDrawDate}.</p>}
        {actionData?.error && <p><strong>{actionData.error}</strong></p>}
      </section>

      <section style={card}>
        <h2>Your Primary Picks</h2>
        <p><strong>Method:</strong> {r.selectedStrategy === "random" ? "Random baseline" : "Qualified ensemble"}</p>
        <p>{r.evidenceStatus === "robust-candidate-edge" ? "The experimental model currently passes the robustness gate. These remain lottery picks, not guaranteed predictions." : "No model currently proves a reliable advantage over random selection, so the primary set remains the honest baseline."}</p>
        <TicketList tickets={r.tickets} />
      </section>

      {r.researchTickets?.length > 0 && (
        <section style={card}>
          <h2>Experimental Model Picks</h2>
          <p>These are what the ensemble model prefers right now. They are tracked separately and are not promoted to primary picks unless the model passes the robustness gate.</p>
          <TicketList tickets={r.researchTickets} />
        </section>
      )}

      <section style={card}>
        <h2>Forward Track Record</h2>
        <p>Frozen predictions: <strong>{ledger.summary.predictions}</strong> · Completed drawings: <strong>{ledger.summary.settledDraws}</strong></p>
        {ledger.summary.settledDraws > 0 ? (
          <>
            <p>Primary average white matches: <strong>{ledger.summary.primary.averageWhiteMatches.toFixed(3)}</strong> · Powerball hit rate: <strong>{(ledger.summary.primary.powerballHitRate * 100).toFixed(2)}%</strong></p>
            <p>Experimental average white matches: <strong>{ledger.summary.research.averageWhiteMatches.toFixed(3)}</strong> · Powerball hit rate: <strong>{(ledger.summary.research.powerballHitRate * 100).toFixed(2)}%</strong></p>
          </>
        ) : <p>No forward-tested drawing has completed yet.</p>}
        {ledger.rows.length > 0 && <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}><thead><tr><th align="left">Draw</th><th align="left">Method</th><th align="left">Status</th></tr></thead><tbody>{ledger.rows.map(row => <tr key={row.id}><td>{row.targetDrawDate}</td><td>{row.selectedStrategy}</td><td>{row.settled ? "Completed" : "Waiting for result"}</td></tr>)}</tbody></table>}
      </section>

      <details style={card}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 18 }}>Research Details</summary>
        <div style={{ marginTop: 16 }}>
          <p><strong>Model verdict:</strong> {v.verdict}</p>
          <p>Historical draws analyzed: <strong>{data.drawCount}</strong> · {data.firstDraw} to {data.latestDraw}</p>
          <p>Positive holdout windows: <strong>{v.robustness.holdoutPositive}/{v.robustness.holdoutWindows}</strong> · Clear positive 95% CI: <strong>{v.robustness.holdoutCIClear}/{v.robustness.holdoutWindows}</strong> · Positive weight variants: <strong>{v.robustness.sensitivityPositive}/{v.robustness.sensitivityVariants}</strong></p>

          <h3>Rolling holdouts</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Window</th><th align="right">Advantage</th><th align="right">95% CI</th></tr></thead><tbody>{v.holdouts.map((row, i) => <tr key={i}><td>{row.holdoutStartIndex}–{row.holdoutEndIndex}</td><td align="right">{row.comparison.advantage.toFixed(4)}</td><td align="right">[{row.comparison.approximate95CI.map(x => x.toFixed(4)).join(", ")}]</td></tr>)}</tbody></table>

          <h3>Weight sensitivity</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Variant</th><th align="right">Advantage</th><th align="right">95% CI</th></tr></thead><tbody>{v.sensitivity.map(row => <tr key={row.name}><td>{row.name}</td><td align="right">{row.comparison.advantage.toFixed(4)}</td><td align="right">[{row.comparison.approximate95CI.map(x => x.toFixed(4)).join(", ")}]</td></tr>)}</tbody></table>

          <h3>Historical strategy tournament</h3>
          {data.tournament.map(windowResult => <div key={windowResult.warmup} style={{ marginTop: 18 }}><strong>Warmup {windowResult.warmup}</strong><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">Strategy</th><th align="right">Advantage</th><th align="right">95% CI</th></tr></thead><tbody>{windowResult.ranking.map(row => <tr key={row.name}><td>{row.name}</td><td align="right">{row.comparison.advantage.toFixed(4)}</td><td align="right">[{row.comparison.approximate95CI.map(x => x.toFixed(4)).join(", ")}]</td></tr>)}</tbody></table></div>)}
        </div>
      </details>
    </div>
  );
}
