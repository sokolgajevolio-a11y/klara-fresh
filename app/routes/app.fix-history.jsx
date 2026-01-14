import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getFixHistory } from "../utils/fixEngine.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const history = await getFixHistory(session.shop);
  return { history };
};

export default function FixHistory() {
  const { history } = useLoaderData();

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "24px" }}>Fix History ({history.length})</h1>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", color: "#6b7280", padding: "60px 20px" }}>
          <p>No fixes applied yet.</p>
        </div>
      ) : (
        history.map((fix) => (
          <div key={fix.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px", fontWeight: "600" }}>{fix.action}</span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", background: fix.success ? "#d1fae5" : "#fee2e2", color: fix.success ? "#065f46" : "#991b1b" }}>
                {fix.success ? "Success" : "Failed"}
              </span>
            </div>
            <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "12px" }}>
              {fix.issue?.title || fix.issue?.entityId} • {new Date(fix.createdAt).toLocaleString()}
            </p>
            <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace" }}>
              <strong>Before:</strong> {fix.beforeSnapshot}<br />
              <strong>After:</strong> {fix.afterSnapshot}
            </div>
            {fix.errorMessage && (
              <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "12px" }}>Error: {fix.errorMessage}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
