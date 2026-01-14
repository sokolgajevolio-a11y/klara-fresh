export default function ReportsRoute() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0f1419" }}>
      <div style={{ width: "240px", background: "#0f1419", borderRight: "1px solid #1f2937", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "24px" }}>⚡</div>
        <button style={{ height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>✓ New Scan</button>
        <input type="text" placeholder="Search past scans" style={{ height: "36px", background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", fontSize: "13px", padding: "0 12px", marginBottom: "24px" }} />
        <div style={{ marginBottom: "32px" }}>
          {["Dashboard", "Issues", "Fixed", "Reports", "Settings"].map((item) => (
            <div key={item} style={{ padding: "10px 12px", borderRadius: "6px", fontSize: "13px", color: item === "Reports" ? "#06b6d4" : "#d1d5db", cursor: "pointer", background: item === "Reports" ? "#1f2937" : "transparent", marginBottom: "8px" }}>
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
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "32px" }}>Reports & Analytics</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Store Health", value: "87/100", change: "+14%" },
            { label: "Issues Fixed", value: "23", change: "+5" },
            { label: "Avg Response Time", value: "2.3s", change: "-0.5s" },
          ].map((stat, idx) => (
            <div key={idx} style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "12px", color: "#6b7a94", marginBottom: "8px" }}>{stat.label}</div>
              <div style={{ fontSize: "32px", fontWeight: "700", color: "#06b6d4", marginBottom: "8px" }}>{stat.value}</div>
              <div style={{ fontSize: "12px", color: "#10b981" }}>{stat.change}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "white", marginBottom: "16px" }}>Store Health Trend</h3>
          <div style={{ height: "200px", background: "#1a2332", borderRadius: "8px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "16px", gap: "8px" }}>
            {[45, 52, 61, 68, 75, 82, 87].map((height, idx) => (
              <div key={idx} style={{ flex: 1, height: `${height * 2}px`, background: "linear-gradient(180deg, #4f7fff, #2d5ceb)", borderRadius: "4px 4px 0 0" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ padding: "10px 20px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Export PDF</button>
          <button style={{ padding: "10px 20px", background: "transparent", border: "1px solid #242f42", borderRadius: "8px", color: "#d1d9e6", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Export CSV</button>
        </div>
      </div>

      <div style={{ width: "340px", background: "#121826", borderLeft: "1px solid #1e2638", padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7a94", marginBottom: "16px" }}>Quick Stats</div>
        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>↑ 42%</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>Performance Increase</div>
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#06b6d4" }}>14 days</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>Since Last Scan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
