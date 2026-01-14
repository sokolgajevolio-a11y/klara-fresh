export default function FixedRoute() {
  const changes = [
    { id: 1, title: "Fixed alt text on 5 products", category: "Product Images", date: "2024-01-14", before: "No alt text", after: "Alt text added", canUndo: true },
    { id: 2, title: "Optimized image sizes", category: "Product Images", date: "2024-01-13", before: "2MB average", after: "500KB average", canUndo: true },
    { id: 3, title: "Updated 12 descriptions", category: "Descriptions", date: "2024-01-12", before: "Generic text", after: "SEO optimized", canUndo: false },
  ];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0f1419" }}>
      <div style={{ width: "240px", background: "#0f1419", borderRight: "1px solid #1f2937", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "24px" }}>⚡</div>
        <button style={{ height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>✓ New Scan</button>
        <input type="text" placeholder="Search past scans" style={{ height: "36px", background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", fontSize: "13px", padding: "0 12px", marginBottom: "24px" }} />
        <div style={{ marginBottom: "32px" }}>
          {["Dashboard", "Issues", "Fixed", "Reports", "Settings"].map((item) => (
            <div key={item} style={{ padding: "10px 12px", borderRadius: "6px", fontSize: "13px", color: item === "Fixed" ? "#06b6d4" : "#d1d5db", cursor: "pointer", background: item === "Fixed" ? "#1f2937" : "transparent", marginBottom: "8px" }}>
              {item}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingTop: "16px", borderTop: "1px solid #374151" }}>
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#d1d5db", cursor: "pointer", borderRadius: "6px", marginBottom: "8px" }}>Help</div>
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#d1d5db", cursor: "pointer", borderRadius: "6px" }}>Account</div>
        </div>
      </div>

      <div style={{ flex: 1, background: "#0f1419", display: "flex", flexDirection: "column", padding: "24px 32px", overflowY: "auto" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "32px" }}>Fixed Changes</h1>
        <div style={{ display: "grid", gap: "16px" }}>
          {changes.map((change) => (
            <div key={change.id} style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "white", marginBottom: "4px" }}>{change.title}</div>
                  <div style={{ fontSize: "12px", color: "#6b7a94" }}>{change.category} • {new Date(change.date).toLocaleDateString()}</div>
                </div>
                {change.canUndo && (
                  <button style={{ padding: "8px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", color: "#ef4444", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                    ↶ Undo
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#6b7a94", marginBottom: "8px", textTransform: "uppercase" }}>Before</div>
                  <div style={{ background: "#1a2332", border: "1px solid #242f42", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#d1d9e6" }}>{change.before}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#6b7a94", marginBottom: "8px", textTransform: "uppercase" }}>After</div>
                  <div style={{ background: "#1a2332", border: "1px solid #242f42", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#10b981" }}>{change.after}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "340px", background: "#121826", borderLeft: "1px solid #1e2638", padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7a94", marginBottom: "16px" }}>Statistics</div>
        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>{changes.length}</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>Total Changes</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#06b6d4" }}>87%</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>Store Health Improved</div>
          </div>
        </div>
      </div>
    </div>
  );
}
