export default function HelpRoute() {
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
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#06b6d4", cursor: "pointer", borderRadius: "6px", marginBottom: "8px", background: "#1f2937" }}>Help</div>
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#d1d5db", cursor: "pointer", borderRadius: "6px" }}>Account</div>
        </div>
      </div>

      <div style={{ flex: 1, background: "#0f1419", display: "flex", flexDirection: "column", padding: "24px 32px", overflowY: "auto" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "32px" }}>Help & Support</h1>
        <div style={{ maxWidth: "700px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "white", marginBottom: "16px" }}>Frequently Asked Questions</h2>
            {[
              { q: "How does Klara scan my store?", a: "Klara uses AI to analyze your product images, descriptions, SEO metadata, and store structure." },
              { q: "Can I undo changes?", a: "Yes! All changes are tracked and can be undone from the Fixed page." },
              { q: "How often should I scan?", a: "We recommend scanning weekly to catch new issues early." },
            ].map((faq, idx) => (
              <div key={idx} style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "8px" }}>{faq.q}</div>
                <div style={{ fontSize: "13px", color: "#d1d9e6" }}>{faq.a}</div>
              </div>
            ))}
          </div>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "white", marginBottom: "16px" }}>Contact Support</h2>
            <div style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "#d1d9e6", marginBottom: "16px" }}>Need help? Reach out to our support team.</p>
              <button style={{ padding: "10px 20px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Email Support</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: "340px", background: "#121826", borderLeft: "1px solid #1e2638", padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7a94", marginBottom: "16px" }}>Resources</div>
        <div style={{ display: "grid", gap: "12px" }}>
          <a href="#" style={{ fontSize: "13px", color: "#06b6d4", textDecoration: "none" }}>Documentation</a>
          <a href="#" style={{ fontSize: "13px", color: "#06b6d4", textDecoration: "none" }}>API Reference</a>
          <a href="#" style={{ fontSize: "13px", color: "#06b6d4", textDecoration: "none" }}>Community Forum</a>
        </div>
      </div>
    </div>
  );
}
