import { useState, useEffect } from "react";
import "../../styles/klara.css";

export default function KlaraDashboardExact() {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(87);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "klara",
      text: "This is Product 1 from 986 Store. Klara operates its Klara thesosomony cod hione sossosess lining is thesosemony.",
    },
    {
      id: 2,
      sender: "klara",
      text: "Klara specifics - hourly prompt Store thay yoursession our the Store.",
    },
    {
      id: 3,
      sender: "klara",
      text: "Census/Stats",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setScanning(false);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [scanning]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "user", text: inputValue }]);
    setInputValue("");
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "var(--bg-primary)" }}>
      {/* LEFT SIDEBAR */}
      <div
        style={{
          width: "240px",
          background: "#0f1419",
          borderRight: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end))",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            marginBottom: "24px",
            cursor: "pointer",
          }}
        >
          ⚡
        </div>

        {/* New Scan Button */}
        <button
          onClick={() => setScanning(true)}
          style={{
            height: "40px",
            background: "linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end))",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "white",
            fontSize: "var(--font-sm)",
            fontWeight: "var(--weight-semibold)",
            cursor: "pointer",
            marginBottom: "20px",
            transition: "brightness 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.brightness = "1.1")}
          onMouseLeave={(e) => (e.target.style.brightness = "1")}
        >
          ✓ New Scan
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Search past scans"
          style={{
            height: "36px",
            background: "var(--bg-card-secondary)",
            border: "1px solid var(--border-secondary)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-secondary)",
            fontSize: "var(--font-sm)",
            padding: "0 12px",
            marginBottom: "24px",
          }}
        />

        {/* MAIN MENU */}
        <div style={{ marginBottom: "32px" }}>
          {/* Dashboard */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#d1d5db",
              cursor: "pointer",
              background: "transparent",
              transition: "background 0.2s",
              marginBottom: "8px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Dashboard
          </div>
          
          {/* Issues */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#d1d5db",
              cursor: "pointer",
              background: "transparent",
              transition: "background 0.2s",
              marginBottom: "8px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Issues
          </div>
          
          {/* Fixed */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#d1d5db",
              cursor: "pointer",
              background: "transparent",
              transition: "background 0.2s",
              marginBottom: "8px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Fixed
          </div>
          
          {/* Reports */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#d1d5db",
              cursor: "pointer",
              background: "transparent",
              transition: "background 0.2s",
              marginBottom: "8px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Reports
          </div>
          
          {/* Settings */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#d1d5db",
              cursor: "pointer",
              background: "transparent",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Settings
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer - Help & Account */}
        <div style={{ paddingTop: "16px", borderTop: "1px solid #374151" }}>
          <div
            style={{
              padding: "10px 12px",
              fontSize: "13px",
              color: "#d1d5db",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "background 0.2s",
              marginBottom: "8px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Help
          </div>
          <div
            style={{
              padding: "10px 12px",
              fontSize: "13px",
              color: "#d1d5db",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1f2937")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            Account
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          background: "var(--bg-secondary)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 32px",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Top Controls */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button style={{ width: "36px", height: "36px", background: "var(--bg-card-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
            ☰
          </button>
          <button style={{ width: "36px", height: "36px", background: "var(--bg-card-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
            ⚙️
          </button>
          <div style={{ marginLeft: "auto", padding: "8px 16px", background: "var(--bg-card-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text-secondary)" }}>
            3-AMep Verw ▼
          </div>
        </div>

        {/* Title & Breadcrumb */}
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
          360 Store Scan
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7a94", marginBottom: "40px" }}>
          Product • Shopify Store • Deperator Store • Meerators
        </p>

        {/* Progress Section */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "12px" }}>
            {scanProgress.toFixed(0)}% Complete
          </div>
          <div style={{ width: "60%", height: "4px", background: "#1a2332", borderRadius: "2px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${scanProgress}%`,
                background: "linear-gradient(90deg, #4f7fff, #06b6d4)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Stats Grid + Sphere */}
        <div style={{ display: "flex", gap: "32px", marginBottom: "48px", position: "relative" }}>
          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "580px" }}>
            {[
              { title: "Product Images", number: "13", label: "issues" },
              { title: "Descriptions", number: "14", label: "issues" },
              { title: "SEO Metadata", number: "6", label: "issues" },
              { title: "Store Structure", number: "3", label: "issues" },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: "#151d2b",
                  border: "1px solid #1e2638",
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#d1d9e6", marginBottom: "12px" }}>
                  {stat.title}
                </div>
                <div style={{ fontSize: "36px", fontWeight: "700", color: "#06b6d4", marginBottom: "8px" }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: "12px", color: "#6b7a94" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* 3D Sphere */}
          <div
            style={{
              position: "absolute",
              right: "-80px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "450px",
              height: "450px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #5b8fff, #1e4db8, #0a1e4a)",
                boxShadow: "0 0 80px rgba(79, 127, 255, 0.6), 0 0 120px rgba(79, 127, 255, 0.4), inset -30px -30px 60px rgba(0, 0, 0, 0.3), inset 30px 30px 60px rgba(123, 165, 255, 0.2)",
                animation: "sphereFloat 6s ease-in-out infinite",
                position: "relative",
              }}
            >
              {/* Rings */}
              <div
                style={{
                  position: "absolute",
                  width: "340px",
                  height: "100px",
                  border: "2px solid rgba(79, 127, 255, 0.6)",
                  borderRadius: "50%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotateX(75deg)",
                  animation: "ringRotate 10s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "300px",
                  height: "90px",
                  border: "2px solid rgba(79, 127, 255, 0.4)",
                  borderRadius: "50%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotateX(75deg) rotateZ(45deg)",
                  animation: "ringRotate 12s linear infinite reverse",
                }}
              />
            </div>

            {/* Completion Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "-20px",
                background: "rgba(15, 20, 25, 0.95)",
                border: "1px solid #1e2638",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#06b6d4",
              }}
            >
              5% Complete
            </div>
          </div>
        </div>

        {/* Before and After Section */}
        <div style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "white", marginBottom: "8px" }}>
            Before and After
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7a94", marginBottom: "24px" }}>
            True differentiations store snippets of the ge committer
          </p>

          {/* Image Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                style={{
                  aspectRatio: "3/4",
                  background: "#1a2332",
                  border: "1px solid #242f42",
                  borderRadius: "10px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(10, 14, 26, 0.95), rgba(10, 14, 26, 0))",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "12px",
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "Courier New", marginBottom: "8px" }}>
                    GE 00 0161 23309 10
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "10px", padding: "4px 8px", background: "rgba(79, 127, 255, 0.15)", border: "1px solid rgba(79, 127, 255, 0.3)", borderRadius: "4px", color: "#06b6d4" }}>
                      Stermilios
                    </span>
                    <span style={{ fontSize: "10px", padding: "4px 8px", background: "rgba(79, 127, 255, 0.15)", border: "1px solid rgba(79, 127, 255, 0.3)", borderRadius: "4px", color: "#06b6d4" }}>
                      Revie
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{
                padding: "11px 28px",
                background: "linear-gradient(135deg, #4f7fff, #2d5ceb)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "brightness 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.brightness = "1.1")}
              onMouseLeave={(e) => (e.target.style.brightness = "1")}
            >
              Apply Fix
            </button>
            <button
              style={{
                padding: "11px 28px",
                background: "transparent",
                border: "1px solid #242f42",
                borderRadius: "8px",
                color: "#d1d9e6",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#1a2332")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Preview All Changes
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div
        style={{
          width: "340px",
          background: "#121826",
          borderLeft: "1px solid #1e2638",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {/* Context Badge */}
        <div
          style={{
            background: "#1a2332",
            border: "1px solid #242f42",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#d1d9e6",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Store Reactions is Escriptios
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, marginBottom: "24px", overflowY: "auto" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4f7fff, #2d5ceb)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "white", marginBottom: "4px" }}>
                    Klara
                  </div>
                  <div
                    style={{
                      background: "#1a2332",
                      border: "1px solid #242f42",
                      borderRadius: "10px",
                      padding: "14px",
                      fontSize: "12px",
                      color: "#d1d9e6",
                      lineHeight: "1.5",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Panel */}
        <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #1e2638" }}>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7a94", marginBottom: "16px" }}>
            Census/Stats
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            {[
              { value: "87/100", label: "Store Health" },
              { value: "2847", label: "Products" },
              { value: "31", label: "Issues Found" },
              { value: "72%", label: "Image Quality" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#06b6d4", marginBottom: "4px" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "11px", color: "#6b7a94", textTransform: "uppercase" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              height: "6px",
              background: "#1a2332",
              borderRadius: "3px",
              marginTop: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "87%",
                background: "linear-gradient(90deg, #10b981, #4f7fff)",
              }}
            />
          </div>
        </div>

        {/* Message Input */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Message Klara..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            style={{
              flex: 1,
              background: "#1a2332",
              border: "1px solid #242f42",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "13px",
              color: "#d1d9e6",
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #4f7fff, #2d5ceb)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
              transition: "brightness 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.brightness = "1.1")}
            onMouseLeave={(e) => (e.target.style.brightness = "1")}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sphereFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes ringRotate {
          from { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg); }
          to { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg); }
        }
      `}</style>
    </div>
  );
}
