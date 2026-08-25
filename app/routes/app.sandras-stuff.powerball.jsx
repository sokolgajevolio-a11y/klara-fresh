import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { fetchPowerballDataset } from "../sandras-stuff/powerball/source.server";
import { runLiveTournament } from "../sandras-stuff/powerball/run.server";
import { recommendTickets } from "../sandras-stuff/powerball/recommend.server";
import { rollingHoldoutValidation, weightSensitivityValidation, summarizeRobustness } from "../sandras-stuff/powerball/validation";

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

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  assertSandraAccess(session);
  const draws = await fetchPowerballDataset();
  const tournament = await runLiveTournament(draws);
  const recommendation = recommendTickets({ draws, tournament, count: 5 });
  const holdouts = rollingHoldoutValidation({ draws });
  const sensitivity = weightSensitivityValidation({ draws });
  const robustness = summarizeRobustness({ holdouts, sensitivity });
  const verdict = verdictFromSummary(robustness);
  return Response.json({
    drawCount: draws.length,
    firstDraw: draws[0]?.date || null,
    latestDraw: draws.at(-1)?.date || null,
    tournament,
    recommendation,
    validation: { verdict, robustness, holdouts, sensitivity },
  });
}

export default function PowerballResearchPage() {
  const data = useLoaderData();
  const r = data.recommendation;
  const v = data.validation;
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1>Sandra's Stuff · Powerball Research</h1>
      <p>Private research tool. Historical patterns are evaluated against random selection; no strategy is treated as a guaranteed predictor.</p>
      <p><strong>Current-era draws:</strong> {data.drawCount} · <strong>Range:</strong> {data.firstDraw} to {data.latestDraw}</p>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Model Robustness</h2>
        <p><strong>Verdict:</strong> {v.verdict}</p>
        <p>
          Holdout windows positive: <strong>{v.robustness.holdoutPositive}/{v.robustness.holdoutWindows}</strong> ·
          Clear positive 95% CI: <strong>{v.robustness.holdoutCIClear}/{v.robustness.holdoutWindows}</strong> ·
          Weight variants positive: <strong>{v.robustness.sensitivityPositive}/{v.robustness.sensitivityVariants}</strong>
        </p>
        <p>{v.verdict === "stable"
          ? "The ensemble survives the current holdout and sensitivity thresholds. This is still experimental evidence, not proof of lottery predictability."
          : v.verdict === "questionable"
            ? "Some validation tests are positive, but the evidence is not stable enough to claim an edge."
            : "The ensemble does not currently survive robustness testing. Treat its apparent patterns as unsupported."}</p>

        <h3>Rolling holdouts</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th align="left">Holdout</th><th align="right">Advantage</th><th align="right">95% CI</th></tr></thead>
          <tbody>{v.holdouts.map((row, i) => (
            <tr key={i}>
              <td>{row.holdoutStartIndex}–{row.holdoutEndIndex}</td>
              <td align="right">{row.comparison.advantage.toFixed(4)}</td>
              <td align="right">[{row.comparison.approximate95CI.map(x => x.toFixed(4)).join(", ")}]</td>
            </tr>
          ))}</tbody>
        </table>

        <h3>Weight sensitivity</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th align="left">Variant</th><th align="right">Advantage</th><th align="right">95% CI</th></tr></thead>
          <tbody>{v.sensitivity.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td align="right">{row.comparison.advantage.toFixed(4)}</td>
              <td align="right">[{row.comparison.approximate95CI.map(x => x.toFixed(4)).join(", ")}]</td>
            </tr>
          ))}</tbody>
        </table>
      </section>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Best Current Evidence</h2>
        <p><strong>Status:</strong> {r.evidenceStatus === "candidate-edge" ? "Experimental candidate edge" : "No demonstrated edge over random"}</p>
        <p><strong>Selected method:</strong> {r.selectedStrategy}</p>
        <p>{r.explanation}</p>
        <h3>Candidate tickets</h3>
        <ol>{r.tickets.map((ticket, i) => <li key={i}><strong>{ticket.white.join(" · ")}</strong> &nbsp; Powerball <strong>{ticket.powerball}</strong></li>)}</ol>
      </section>

      {data.tournament.map((windowResult) => (
        <section key={windowResult.warmup} style={{ marginTop: 28 }}>
          <h2>Warmup {windowResult.warmup}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th align="left">Strategy</th><th align="right">Advantage</th><th align="right">95% CI</th><th align="right">Avg white matches</th><th align="right">PB hit rate</th></tr></thead>
            <tbody>{windowResult.ranking.map((row) => (
              <tr key={row.name}><td>{row.name}</td><td align="right">{row.comparison.advantage.toFixed(4)}</td><td align="right">[{row.comparison.approximate95CI.map(v => v.toFixed(4)).join(", ")}]</td><td align="right">{row.result.averageWhiteMatches.toFixed(4)}</td><td align="right">{(row.result.powerballHitRate * 100).toFixed(2)}%</td></tr>
            ))}</tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
