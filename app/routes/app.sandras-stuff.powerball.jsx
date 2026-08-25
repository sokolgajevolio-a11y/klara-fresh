import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { fetchPowerballDataset } from "../sandras-stuff/powerball/source.server";
import { runLiveTournament } from "../sandras-stuff/powerball/run.server";
import { recommendTickets } from "../sandras-stuff/powerball/recommend.server";

function assertSandraAccess(session) {
  const allowedShop = (process.env.SANDRAS_STUFF_SHOP || "").trim().toLowerCase();
  if (!allowedShop) throw new Response("Sandra's Stuff is not configured", { status: 503 });
  if ((session.shop || "").trim().toLowerCase() !== allowedShop) throw new Response("Not found", { status: 404 });
}

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  assertSandraAccess(session);
  const draws = await fetchPowerballDataset();
  const tournament = await runLiveTournament(draws);
  const recommendation = recommendTickets({ draws, tournament, count: 5 });
  return Response.json({ drawCount: draws.length, firstDraw: draws[0]?.date || null, latestDraw: draws.at(-1)?.date || null, tournament, recommendation });
}

export default function PowerballResearchPage() {
  const data = useLoaderData();
  const r = data.recommendation;
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1>Sandra's Stuff · Powerball Research</h1>
      <p>Private research tool. Historical patterns are evaluated against random selection; no strategy is treated as a guaranteed predictor.</p>
      <p><strong>Current-era draws:</strong> {data.drawCount} · <strong>Range:</strong> {data.firstDraw} to {data.latestDraw}</p>

      <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Best Current Evidence</h2>
        <p><strong>Status:</strong> {r.evidenceStatus === "candidate-edge" ? "Experimental candidate edge" : "No demonstrated edge over random"}</p>
        <p><strong>Selected method:</strong> {r.selectedStrategy}</p>
        <p>{r.explanation}</p>
        <h3>Candidate tickets</h3>
        <ol>
          {r.tickets.map((ticket, i) => <li key={i}><strong>{ticket.white.join(" · ")}</strong> &nbsp; Powerball <strong>{ticket.powerball}</strong></li>)}
        </ol>
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
