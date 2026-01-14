import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return { shop: session.shop };
};

export default function ScanPage() {
  const { shop } = useLoaderData();
  const fetcher = useFetcher();
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const startScan = async () => {
    setScanning(true);
    setResults(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Scan error:", error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>
          360° Store Scan
        </h1>
        <p style={{ color: "#666", fontSize: "16px" }}>
          Comprehensive analysis of your entire Shopify store
        </p>
      </div>

      {!scanning && !results && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "48px",
          textAlign: "center",
          border: "1px solid #e5e5e5",
        }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>🔍</div>
          <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#1a1a1a" }}>
            Ready to Scan Your Store
          </h2>
          <p style={{ color: "#666", marginBottom: "32px", fontSize: "15px" }}>
            We'll analyze products, collections, SEO, performance, and more
          </p>
          <button
            onClick={startScan}
            style={{
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "600",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Start 360° Scan
          </button>
        </div>
      )}

      {scanning && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "48px",
          textAlign: "center",
          border: "1px solid #e5e5e5",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "24px", animation: "pulse 2s infinite" }}>
            ⚡
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "12px", color: "#1a1a1a" }}>
            Scanning Your Store...
          </h2>
          <p style={{ color: "#666", fontSize: "15px" }}>
            Analyzing products, collections, SEO, and performance
          </p>
          <div style={{
            marginTop: "32px",
            height: "4px",
            background: "#e5e5e5",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              background: "#3b82f6",
              animation: "progress 2s ease-in-out infinite",
            }} />
          </div>
        </div>
      )}

      {results && (
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}>
            {results.summary && Object.entries(results.summary).map(([key, value]) => (
              <div key={key} style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e5e5e5",
              }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", textTransform: "uppercase" }}>
                  {key.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#1a1a1a" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e5e5",
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#1a1a1a" }}>
              Issues Found
            </h3>
            {results.issues && results.issues.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {results.issues.slice(0, 10).map((issue, i) => (
                  <div key={i} style={{
                    padding: "16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${issue.severity === 'critical' ? '#ef4444' : issue.severity === 'high' ? '#f59e0b' : '#3b82f6'}`,
                  }}>
                    <div style={{ fontWeight: "500", color: "#1a1a1a", marginBottom: "4px" }}>
                      {issue.title || issue.message}
                    </div>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      {issue.type} • {issue.severity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#666" }}>No issues found! Your store looks great.</p>
            )}
          </div>

          <button
            onClick={() => setResults(null)}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "500",
              background: "white",
              color: "#3b82f6",
              border: "1px solid #3b82f6",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Run New Scan
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
