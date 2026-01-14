import { useState } from "react";

const mockIssues = [
  { id: 1, category: "Product Images", title: "Missing alt text on 5 products", severity: "high", date: "2024-01-14", fixed: false },
  { id: 2, category: "Product Images", title: "Image resolution too low", severity: "medium", date: "2024-01-13", fixed: false },
  { id: 3, category: "Descriptions", title: "Duplicate descriptions found", severity: "medium", date: "2024-01-12", fixed: false },
  { id: 4, category: "SEO Metadata", title: "Missing meta descriptions", severity: "high", date: "2024-01-11", fixed: false },
  { id: 5, category: "Store Structure", title: "Broken navigation links", severity: "high", date: "2024-01-10", fixed: false },
  { id: 6, category: "Product Images", title: "Inconsistent image sizes", severity: "low", date: "2024-01-09", fixed: true },
];

export default function IssuesRoute() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  const filteredIssues = filterCategory === "all" ? mockIssues : mockIssues.filter(issue => issue.category === filterCategory);
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === "priority") {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return new Date(b.date) - new Date(a.date);
  });

  const severityColors = {
    high: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444" },
    medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
    low: { bg: "rgba(251, 191, 36, 0.15)", text: "#fbbf24" },
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0f1419" }}>
      <div style={{ width: "240px", background: "#0f1419", borderRight: "1px solid #1f2937", padding: "20px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "24px", cursor: "pointer" }}>⚡</div>
        <button style={{ height: "40px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "20px" }}>✓ New Scan</button>
        <input type="text" placeholder="Search past scans" style={{ height: "36px", background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", fontSize: "13px", padding: "0 12px", marginBottom: "24px" }} />
        <div style={{ marginBottom: "32px" }}>
          {["Dashboard", "Issues", "Fixed", "Reports", "Settings"].map((item) => (
            <div key={item} style={{ padding: "10px 12px", borderRadius: "6px", fontSize: "13px", color: item === "Issues" ? "#06b6d4" : "#d1d5db", cursor: "pointer", background: item === "Issues" ? "#1f2937" : "transparent", marginBottom: "8px" }}>
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
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "32px" }}>Issues</h1>
        <div style={{ display: "flex", gap: "16px", marginBottom: "32px", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7a94", marginRight: "8px" }}>Filter:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", padding: "8px 12px", fontSize: "13px" }}>
              <option value="all">All Categories</option>
              <option value="Product Images">Product Images</option>
              <option value="Descriptions">Descriptions</option>
              <option value="SEO Metadata">SEO Metadata</option>
              <option value="Store Structure">Store Structure</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#6b7a94", marginRight: "8px" }}>Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ background: "#1a2332", border: "1px solid #242f42", borderRadius: "6px", color: "#d1d9e6", padding: "8px 12px", fontSize: "13px" }}>
              <option value="priority">By Priority</option>
              <option value="date">By Date</option>
            </select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button style={{ padding: "10px 20px", background: "linear-gradient(135deg, #4f7fff, #2d5ceb)", border: "none", borderRadius: "8px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Fix All ({sortedIssues.filter(i => !i.fixed).length})</button>
          </div>
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          {sortedIssues.map((issue) => (
            <div key={issue.id} style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "16px", opacity: issue.fixed ? 0.6 : 1 }}>
              <input type="checkbox" style={{ width: "20px", height: "20px", cursor: "pointer" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "4px" }}>{issue.title}</div>
                <div style={{ fontSize: "12px", color: "#6b7a94" }}>{issue.category} • {new Date(issue.date).toLocaleDateString()}</div>
              </div>
              <div style={{ padding: "4px 12px", background: severityColors[issue.severity].bg, borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: severityColors[issue.severity].text, textTransform: "uppercase" }}>{issue.severity}</div>
              {issue.fixed && <div style={{ padding: "4px 12px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#10b981" }}>Fixed</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "340px", background: "#121826", borderLeft: "1px solid #1e2638", padding: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7a94", marginBottom: "16px" }}>Summary</div>
        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#ef4444" }}>{sortedIssues.filter(i => !i.fixed).length}</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>Open Issues</div>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981" }}>{sortedIssues.filter(i => i.fixed).length}</div>
            <div style={{ fontSize: "12px", color: "#6b7a94" }}>Fixed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
