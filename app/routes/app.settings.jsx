export default function SettingsRoute() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0f1419" }}>
      <div style={{ width: "240px", background: "#0f1419", borderRight: "1px solid #1f2937", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "24px" }}>⚡</div>
        <button style={{ height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>✓ New Scan</button>
        <input type="text" placeholder="Search past scans" style={{ height: "36px", background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", fontSize: "13px", padding: "0 12px", marginBottom: "24px" }} />
        <div style={{ marginBottom: "32px" }}>
          {["Dashboard", "Issues", "Fixed", "Reports", "Settings"].map((item) => (
            <div key={item} style={{ padding: "10px 12px", borderRadius: "6px", fontSize: "13px", color: item === "Settings" ? "#06b6d4" : "#d1d5db", cursor: "pointer", background: item === "Settings" ? "#1f2937" : "transparent", marginBottom: "8px" }}>
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
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "32px" }}>Settings</h1>
        <div style={{ maxWidth: "600px" }}>
          {[
            { title: "Auto-fix Rules", description: "Enable automatic fixes for specific issue types" },
            { title: "Brand Preferences", description: "Set tone of voice and brand guidelines" },
            { title: "Notifications", description: "Manage scan alerts and reports" },
            { title: "Billing & Subscription", description: "Manage your plan and payment method" },
          ].map((setting, idx) => (
            <div key={idx} style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "white", marginBottom: "4px" }}>{setting.title}</div>
                <div style={{ fontSize: "13px", color: "#6b7a94" }}>{setting.description}</div>
              </div>
              <button style={{ padding: "8px 16px", background: "transparent", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Configure</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "340px", background: "#121826", borderLeft: "1px solid #1e2638", padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7a94", marginBottom: "16px" }}>Plan Info</div>
        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "4px" }}>Pro Plan</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>$99/month</div>
          </div>
          <button style={{ padding: "10px 16px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Upgrade</button>
        </div>
      </div>
    </div>
  );
}
