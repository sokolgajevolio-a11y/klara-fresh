import { useState, useEffect } from "react";
import "../../../app/styles/klara.css";

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
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-primary)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          overflowY: "auto",
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

        {/* TODAY Section */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "var(--font-xxs)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            TODAY
          </div>
          <div
            style={{
              padding: "9px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-sm)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              background: "var(--bg-card-secondary)",
            }}
          >
            🔍 Store Audit - Jan 10
          </div>
        </div>

        {/* PREVIOUS Section */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "var(--font-xxs)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            PREVIOUS
          </div>
          <div
            style={{
              padding: "9px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-sm)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            🔍 Store Audit - Jan 10
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--border-primary)" }}>
          <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", cursor: "pointer", marginBottom: "12px" }}>
            ⚙️ Settings
          </div>
          <div style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", cursor: "pointer" }}>
            ❓ Help
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
          <button style={{ width: "36px", height: "36px", background: "var(--bg-card-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
            🔧
          </button>
          <div style={{ marginLeft: "auto", padding: "8px 16px", background: "var(--bg-card-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-sm)" }}>
            3-AMep Verw ▼
          </div>
        </div>

        {/* Title and Breadcrumb */}
        <h1 style={{ fontSize: "var(--font-xxl)", fontWeight: "var(--weight-bold)", marginBottom: "8px", lineHeight: "var(--leading-tight)" }}>
          360 Store Scan
        </h1>
        <div style={{ fontSize: "var(--font-base)", color: "var(--text-tertiary)", marginBottom: "40px" }}>
          Product · Shopify Store · Deperator Store · Meerators
        </div>

        {/* Progress Section */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "var(--font-lg)", fontWeight: "var(--weight-semibold)", marginBottom: "12px" }}>
            {scanProgress.toFixed(0)}% Complete
          </div>
          <div style={{ width: "60%", height: "4px", background: "var(--border-secondary)", borderRadius: "2px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--blue-gradient-start), var(--cyan-accent))",
                width: `${scanProgress}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Stats Grid + Sphere Container */}
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
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-xl)",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(79, 127, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "var(--font-sm)", fontWeight: "var(--weight-semibold)", marginBottom: "12px", color: "var(--text-secondary)" }}>
                  {stat.title}
                </div>
                <div style={{ fontSize: "var(--font-xl)", fontWeight: "var(--weight-bold)", color: "var(--cyan-accent)", marginBottom: "4px" }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: "var(--font-xxs)", color: "var(--text-tertiary)" }}>
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
                position: "relative",
                width: "280px",
                height: "280px",
                background: "radial-gradient(circle at 35% 35%, #5b8fff, #1e4db8, #0a1e4a)",
                borderRadius: "50%",
                boxShadow: `
                  0 0 80px rgba(79, 127, 255, 0.6),
                  0 0 120px rgba(79, 127, 255, 0.4),
                  inset -30px -30px 60px rgba(0, 0, 0, 0.3),
                  inset 30px 30px 60px rgba(123, 165, 255, 0.2)
                `,
                animation: "sphereFloat 6s ease-in-out infinite",
              }}
            >
              {/* Ring 1 */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "340px",
                  height: "100px",
                  border: "2px solid rgba(79, 127, 255, 0.6)",
                  borderRadius: "50%",
                  animation: "ringRotate 12s linear infinite",
                }}
              />
              {/* Ring 2 */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotateZ(45deg)",
                  width: "300px",
                  height: "90px",
                  border: "2px solid rgba(79, 127, 255, 0.4)",
                  borderRadius: "50%",
                  animation: "ringRotate 10s linear infinite reverse",
                }}
              />
              {/* Particles */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    background: "rgba(79, 127, 255, 0.8)",
                    borderRadius: "50%",
                    top: `${30 + Math.sin(i) * 40}%`,
                    left: `${30 + Math.cos(i) * 40}%`,
                    animation: `particleFloat ${2 + i * 0.3}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>

            {/* Completion Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "-20px",
                background: "rgba(15, 20, 25, 0.95)",
                border: "1px solid var(--border-primary)",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-sm)",
                fontWeight: "var(--weight-semibold)",
              }}
            >
              5% Complete
            </div>
          </div>
        </div>

        {/* Before and After Section */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-xl)",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "var(--font-md)", fontWeight: "var(--weight-semibold)" }}>
              Before and After
            </h2>
            <div style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)" }}>
              True differentiations store snippets of the ge committer
            </div>
          </div>

          {/* Image Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "3/4",
                  background: "var(--bg-card-secondary)",
                  border: "1px solid var(--border-secondary)",
                  borderRadius: "var(--radius-lg)",
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
                  <div style={{ fontSize: "var(--font-xxxs)", fontFamily: "Courier New", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    GE 00 0161 23309 10
                  </div>
                  <div style={{ fontSize: "var(--font-xxxs)", fontFamily: "Courier New", color: "var(--text-tertiary)" }}>
                    On snooze Esnoose
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    <span style={{ fontSize: "var(--font-xxxs)", background: "rgba(79, 127, 255, 0.15)", border: "1px solid rgba(79, 127, 255, 0.3)", padding: "2px 6px", borderRadius: "3px" }}>
                      Stermitios
                    </span>
                    <span style={{ fontSize: "var(--font-xxxs)", background: "rgba(79, 127, 255, 0.15)", border: "1px solid rgba(79, 127, 255, 0.3)", padding: "2px 6px", borderRadius: "3px" }}>
                      Revieus
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={{
                background: "linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end))",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "white",
                padding: "11px 28px",
                fontSize: "var(--font-base)",
                fontWeight: "var(--weight-semibold)",
                cursor: "pointer",
              }}
            >
              Apply Fix
            </button>
            <button
              style={{
                background: "transparent",
                border: "1px solid var(--border-secondary)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-secondary)",
                padding: "11px 28px",
                fontSize: "var(--font-base)",
                fontWeight: "var(--weight-semibold)",
                cursor: "pointer",
              }}
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
          background: "var(--bg-sidebar)",
          borderLeft: "1px solid var(--border-primary)",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {/* Context Badge */}
        <div
          style={{
            background: "var(--bg-card-secondary)",
            border: "1px solid var(--border-secondary)",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-xs)",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ width: "8px", height: "8px", background: "var(--blue-gradient-start)", borderRadius: "50%" }} />
          Store Rieactions is Escrptios
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", gap: "8px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  background: "linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end))",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--font-sm)", fontWeight: "var(--weight-semibold)", marginBottom: "4px" }}>
                  Klara
                </div>
                <div
                  style={{
                    background: "var(--bg-card-secondary)",
                    border: "1px solid var(--border-secondary)",
                    borderRadius: "var(--radius-lg)",
                    padding: "14px",
                    fontSize: "var(--font-xs)",
                    color: "var(--text-secondary)",
                    lineHeight: "var(--leading-relaxed)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Panel */}
        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid var(--border-primary)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {[
              { value: "87/100", label: "Store Health" },
              { value: "2847", label: "Products" },
              { value: "31", label: "Issues Found" },
              { value: "72%", label: "Image Quality" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div style={{ fontSize: "22px", fontWeight: "var(--weight-bold)", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "var(--font-xxs)", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              height: "6px",
              background: "var(--border-secondary)",
              borderRadius: "3px",
              marginTop: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--green-success), var(--blue-gradient-start))",
                width: "75%",
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
              background: "var(--bg-card-secondary)",
              border: "1px solid var(--border-secondary)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              padding: "12px",
              fontSize: "var(--font-sm)",
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              background: "linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end))",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "white",
              padding: "12px 16px",
              cursor: "pointer",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
