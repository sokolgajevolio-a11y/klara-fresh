export default function AccountRoute() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0f1419" }}>
      <div style={{ width: "240px", background: "#0f1419", borderRight: "1px solid #1f2937", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "24px" }}>⚡</div>
        <button style={{ height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>✓ New Scan</button>
        <input type="text" placeholder="Search past scans" style={{ height: "36px", background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", fontSize: "13px", padding: "0 12px", marginBottom: "24px" }} />
        <div style={{ marginBottom: "32px" }}>
          {["Dashboard", "Issues", "Fixed", "Reports", "Settings"].map((item) => (
            <div key={item} style={{ padding: "10px 12px", borderRadius: "6px", fontSize: "13px", color: "#d1d5db", cursor: "pointer", background: "transparent", marginBottom: "8px" }}>
              {item}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingTop: "16px", borderTop: "1px solid #374151" }}>
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#d1d5db", cursor: "pointer", borderRadius: "6px", marginBottom: "8px" }}>Help</div>
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#06b6d4", cursor: "pointer", borderRadius: "6px", background: "#1f2937" }}>Account</div>
        </div>
      </div>

      <div style={{ flex: 1, background: "#0f1419", display: "flex", flexDirection: "column", padding: "24px 32px", overflowY: "auto" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "32px" }}>Account</h1>
        <div style={{ maxWidth: "600px" }}>
          <div style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "white", marginBottom: "16px" }}>Profile Information</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#6b7a94", display: "block", marginBottom: "8px" }}>Email</label>
              <input type="email" value="user@example.com" style={{ width: "100%", background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", padding: "10px 12px", fontSize: "13px" }} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#6b7a94", display: "block", marginBottom: "8px" }}>Store Name</label>
              <input type="text" value="My Awesome Store" style={{ width: "100%", background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", padding: "10px 12px", fontSize: "13px" }} />
            </div>
            <button style={{ padding: "10px 20px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Save Changes</button>
          </div>

          <div style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "white", marginBottom: "16px" }}>Danger Zone</h2>
            <button style={{ padding: "10px 20px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#ef4444", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ width: "340px", background: "#121826", borderLeft: "1px solid #1e2638", padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7a94", marginBottom: "16px" }}>Account Status</div>
        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "4px" }}>Status</div>
            <div style={{ fontSize: "12px", color: "#10b981" }}>Active</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "4px" }}>Member Since</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>January 2024</div>
          </div>
        </div>
      </div>
    </div>
  );
}
