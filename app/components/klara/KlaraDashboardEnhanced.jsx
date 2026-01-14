import { useState, useEffect } from "react";
import "../../styles/klara.css";

export default function KlaraDashboardEnhanced() {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [fixing, setFixing] = useState(false);
  const [fixingProgress, setFixingProgress] = useState(0);
  const [fixingPhase, setFixingPhase] = useState(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [sphereRotation, setSphereRotation] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "klara",
      text: "Ready to scan your store. Click the sphere to begin.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  // Scanning effect
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          setScanning(false);
          setMessages((m) => [...m, { id: Date.now(), sender: "klara", text: "Scan complete! I found 36 issues across your store." }]);
          return 100;
        }
        return prev + Math.random() * 8;
      });
      setSphereRotation((prev) => (prev + 2) % 360);
    }, 200);
    return () => clearInterval(interval);
  }, [scanning]);

  // Fixing effect
  useEffect(() => {
    if (!fixing) return;
    const phases = ["Product Images", "Descriptions", "SEO Metadata", "Store Structure"];
    let currentPhaseIdx = 0;

    const interval = setInterval(() => {
      setFixingProgress((prev) => {
        const newProgress = prev + Math.random() * 6;
        if (newProgress >= 100) {
          setFixing(false);
          setFixingPhase(null);
          setMessages((m) => [...m, { id: Date.now(), sender: "klara", text: "✓ All fixes applied successfully! Your store is now optimized." }]);
          return 100;
        }
        const phaseIdx = Math.floor((newProgress / 100) * phases.length);
        if (phaseIdx !== currentPhaseIdx && phaseIdx < phases.length) {
          currentPhaseIdx = phaseIdx;
          setFixingPhase(phases[phaseIdx]);
        }
        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [fixing]);

  const handleScanClick = () => {
    setScanning(true);
    setScanProgress(0);
    setSphereRotation(0);
    setMessages((m) => [...m, { id: Date.now(), sender: "klara", text: "Scanning your store..." }]);
  };

  const handleFixClick = () => {
    setShowPermissionDialog(true);
  };

  const handleApproveFixing = () => {
    setShowPermissionDialog(false);
    setFixing(true);
    setFixingProgress(0);
    setFixingPhase("Product Images");
    setMessages((m) => [...m, { id: Date.now(), sender: "klara", text: "Starting autonomous fixes. I'll update you as I work..." }]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "user", text: inputValue }]);
    setInputValue("");
  };

  const scanningElements = [
    "Product Images",
    "Descriptions",
    "SEO Metadata",
    "Store Structure",
    "Navigation",
    "Performance",
  ];

  const currentScanningElement = scanningElements[Math.floor((scanProgress / 100) * scanningElements.length)];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0f1419" }}>
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
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #4f7fff, #2d5ceb)",
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

        <button
          onClick={() => setScanning(true)}
          style={{
            height: "40px",
            background: "linear-gradient(135deg, #4f7fff, #2d5ceb)",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "20px",
            transition: "brightness 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.brightness = "1.1")}
          onMouseLeave={(e) => (e.target.style.brightness = "1")}
        >
          ✓ New Scan
        </button>

        <input
          type="text"
          placeholder="Search past scans"
          style={{
            height: "36px",
            background: "#1a2332",
            border: "1px solid #242f42",
            borderRadius: "6px",
            color: "#d1d9e6",
            fontSize: "13px",
            padding: "0 12px",
            marginBottom: "24px",
          }}
        />

        <div style={{ marginBottom: "32px" }}>
          {["Dashboard", "Issues", "Fixed", "Reports", "Settings"].map((item) => (
            <div
              key={item}
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                color: item === "Dashboard" ? "#06b6d4" : "#d1d5db",
                cursor: "pointer",
                background: item === "Dashboard" ? "#1f2937" : "transparent",
                marginBottom: "8px",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ paddingTop: "16px", borderTop: "1px solid #374151" }}>
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#d1d5db", cursor: "pointer", borderRadius: "6px", marginBottom: "8px" }}>
            Help
          </div>
          <div style={{ padding: "10px 12px", fontSize: "13px", color: "#d1d5db", cursor: "pointer", borderRadius: "6px" }}>
            Account
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          background: "#0f1419",
          display: "flex",
          flexDirection: "column",
          padding: "24px 32px",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <h1 style={{ fontSize: "48px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
          360 Store Scan
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7a94", marginBottom: "40px" }}>
          AI-powered store optimization and autonomous fixing
        </p>

        {/* Progress Section */}
        {(scanning || fixing) && (
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "12px" }}>
              {fixing ? `Fixing: ${fixingPhase}` : `Scanning: ${currentScanningElement}`}
            </div>
            <div style={{ width: "60%", height: "8px", background: "#1a2332", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  height: "100%",
                  width: `${fixing ? fixingProgress : scanProgress}%`,
                  background: fixing ? "linear-gradient(90deg, #ef4444, #f59e0b)" : "linear-gradient(90deg, #4f7fff, #06b6d4)",
                  transition: "width 0.3s ease",
                  boxShadow: fixing ? "0 0 20px rgba(239, 68, 68, 0.6)" : "0 0 20px rgba(79, 127, 255, 0.6)",
                }}
              />
            </div>
            <div style={{ fontSize: "13px", color: "#6b7a94", marginTop: "8px" }}>
              {fixing ? fixingProgress.toFixed(0) : scanProgress.toFixed(0)}% Complete
            </div>
          </div>
        )}

        {/* Stats Grid + Sphere */}
        <div style={{ display: "flex", gap: "32px", marginBottom: "48px", position: "relative" }}>
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
                  background: fixing && fixingPhase === stat.title ? "#1a2b3a" : "#151d2b",
                  border: fixing && fixingPhase === stat.title ? "2px solid #06b6d4" : "1px solid #1e2638",
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  animation: fixing && fixingPhase === stat.title ? "pulseGlow 1s ease-in-out infinite" : "none",
                  boxShadow: fixing && fixingPhase === stat.title ? "0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.1)" : "none",
                }}
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
              onClick={handleScanClick}
              style={{
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background: scanning ? "radial-gradient(circle at 35% 35%, #6ba3ff, #2563eb, #1e40af)" : "radial-gradient(circle at 35% 35%, #5b8fff, #1e4db8, #0a1e4a)",
                boxShadow: scanning
                  ? "0 0 100px rgba(79, 127, 255, 0.8), 0 0 150px rgba(79, 127, 255, 0.5), inset -30px -30px 60px rgba(0, 0, 0, 0.3)"
                  : "0 0 80px rgba(79, 127, 255, 0.6), 0 0 120px rgba(79, 127, 255, 0.4)",
                animation: scanning ? "sphereRotateScan 2s linear infinite" : "sphereFloat 6s ease-in-out infinite",
                position: "relative",
                cursor: "pointer",
                transform: `rotate(${sphereRotation}deg)`,
                transition: "all 0.3s ease",
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
                  animation: scanning ? "ringRotateFast 4s linear infinite" : "ringRotate 10s linear infinite",
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
                  animation: scanning ? "ringRotateFast 5s linear infinite reverse" : "ringRotate 12s linear infinite reverse",
                }}
              />

              {/* Scanning overlay text */}
              {scanning && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600",
                    textAlign: "center",
                    padding: "20px",
                    animation: "fadeInOut 2s ease-in-out infinite",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>Scanning:</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#06b6d4" }}>
                    {currentScanningElement}
                  </div>
                </div>
              )}
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
              {scanning ? `${scanProgress.toFixed(0)}%` : "Ready"}
            </div>
          </div>
        </div>

        {/* Fix Button */}
        {!fixing && !scanning && (
          <button
            onClick={handleFixClick}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "32px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            🚀 Fix These Issues (Autonomous Mode)
          </button>
        )}

        {/* Before and After Section */}
        <div style={{ background: "#151d2b", border: "1px solid #1e2638", borderRadius: "12px", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "white", marginBottom: "8px" }}>
            Before and After
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7a94", marginBottom: "24px" }}>
            See the improvements Klara will make to your store
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
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
                    PRODUCT {idx}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "10px", padding: "4px 8px", background: "rgba(79, 127, 255, 0.15)", border: "1px solid rgba(79, 127, 255, 0.3)", borderRadius: "4px", color: "#06b6d4" }}>
                      Before
                    </span>
                    <span style={{ fontSize: "10px", padding: "4px 8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "4px", color: "#10b981" }}>
                      After
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - CHAT */}
      <div
        style={{
          width: "340px",
          background: "#121826",
          borderLeft: "1px solid #1e2638",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #1e2638" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "white" }}>Klara Assistant</h3>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: msg.sender === "user" ? "#4f7fff" : "#1a2332",
                  color: msg.sender === "user" ? "white" : "#d1d9e6",
                  fontSize: "13px",
                  lineHeight: "1.4",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid #1e2638" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask Klara..."
              style={{
                flex: 1,
                background: "#1a2332",
                border: "1px solid #242f42",
                borderRadius: "6px",
                color: "#d1d9e6",
                padding: "10px 12px",
                fontSize: "13px",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: "#4f7fff",
                border: "none",
                borderRadius: "6px",
                color: "white",
                padding: "10px 16px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Permission Dialog */}
      {showPermissionDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#151d2b",
              border: "1px solid #1e2638",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              color: "white",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
              Permission Required
            </h2>
            <p style={{ fontSize: "14px", color: "#d1d9e6", marginBottom: "24px", lineHeight: "1.6" }}>
              Klara will now autonomously fix the identified issues. This includes:
            </p>
            <ul style={{ fontSize: "13px", color: "#d1d9e6", marginBottom: "24px", lineHeight: "1.8", paddingLeft: "20px" }}>
              <li>Optimizing product images and adding alt text</li>
              <li>Improving product descriptions</li>
              <li>Enhancing SEO metadata</li>
              <li>Organizing store structure</li>
            </ul>
            <p style={{ fontSize: "12px", color: "#6b7a94", marginBottom: "24px" }}>
              ⚠️ Note: Klara follows Shopify's strict guidelines. All changes are reversible.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowPermissionDialog(false)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "transparent",
                  border: "1px solid #242f42",
                  borderRadius: "6px",
                  color: "#d1d9e6",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveFixing}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Approve & Start Fixing
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sphereFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes sphereRotateScan {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @keyframes ringRotate {
          0% { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg); }
        }

        @keyframes ringRotateFast {
          0% { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg); }
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(6, 182, 212, 0.6), inset 0 0 30px rgba(6, 182, 212, 0.2);
          }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
