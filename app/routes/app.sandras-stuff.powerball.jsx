import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { fetchPowerballDataset } from "../sandras-stuff/powerball/source.server";
import { runLiveTournament } from "../sandras-stuff/powerball/run.server";

function assertSandraAccess(session) {
  const allowedShop = (process.env.SANDRAS_STUFF_SHOP || "").trim().toLowerCase();
  if (!allowedShop) throw new Response("Sandra's Stuff is not configured", { status: 503 });
  if ((session.shop || "").trim().toLowerCase() !== allowedShop) {
    throw new Response("Not found", { status: 404 });
  }
}

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  assertSandraAccess(session);

  const draws = await fetchPowerballDataset();
  const tournament = await runLiveTournament(draws);
  return Response.json({
    drawCount: draws.length,
    firstDraw: draws[0]?.date || null,
    latestDraw: draws.at(-1)?.date || null,
    tournament,
  });
}

export default function PowerballResearchPage() {
  const data = useLoaderData();
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1>Sandra's Stuff · Powerball Research</h1>
      <p>Private research tool. Historical patterns are evaluated against random selection; no strategy is treated as a guaranteed predictor.</p>
      <p><strong>Current-era draws:</strong> {data.drawCount} · <strong>Range:</strong> {data.firstDraw} to {data.latestDraw}</p>

      {data.tournament.map((windowResult) => (
        <section key={windowResult.warmup} style={{ marginTop: 28 }}>
          <h2>Warmup {windowResult.warmup}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th align="left">Strategy</th><th align="right">Advantage</th><th align="right">95% CI</th><th align="right">Avg white matches</th><th align="right">PB hit rate</th></tr></thead>
            <tbody>
              {windowResult.ranking.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td align="right">{row.comparison.advantage.toFixed(4)}</td>
                  <td align="right">[{row.comparison.approximate95CI.map(v => v.toFixed(4)).join(", ")}]</td>
                  <td align="right">{row.result.averageWhiteMatches.toFixed(4)}</td>
                  <td align="right">{(row.result.powerballHitRate * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
