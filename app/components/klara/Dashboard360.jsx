import { Page, Card, Button, Badge, Text, Spinner, InlineStack, BlockStack } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ScanVisualization from "./ScanVisualization";
import AgentThinking from "./AgentThinking";
import FairyDustEffect from "./FairyDustEffect";
import CensusStats from "./CensusStats";
import styles from "./Dashboard360.module.css";

export function Dashboard360() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "klara",
      text: "Hi! I'm Klara, your AI Shopify Store Operator. I can scan your entire store for issues, build new products, edit your theme, and help you optimize everything. What would you like me to do?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);

  const scanCategories = [
    {
      id: 1,
      title: "Product Images",
      icon: "🖼️",
      issues: 13,
      issuesLabel: "issues",
      details: [
        { severity: "critical", text: "13 products missing alt text" },
        { severity: "warning", text: "8 images below 1000px width" },
        { severity: "info", text: "5 images need optimization" },
      ],
    },
    {
      id: 2,
      title: "Descriptions",
      icon: "✍️",
      issues: 8,
      issuesLabel: "issues",
      details: [
        { severity: "critical", text: "8 products with duplicate descriptions" },
        { severity: "warning", text: "12 descriptions under 50 characters" },
        { severity: "info", text: "3 descriptions missing keywords" },
      ],
    },
    {
      id: 3,
      title: "SEO Metadata",
      icon: "🔗",
      issues: 6,
      issuesLabel: "issues",
      details: [
        { severity: "critical", text: "6 products missing meta descriptions" },
        { severity: "warning", text: "4 titles over 60 characters" },
        { severity: "info", text: "2 missing canonical tags" },
      ],
    },
    {
      id: 4,
      title: "Store Structure",
      icon: "📊",
      issues: 3,
      issuesLabel: "issues",
      details: [
        { severity: "warning", text: "3 collections with no products" },
        { severity: "info", text: "Navigation menu needs reorganization" },
      ],
    },
  ];

  // Simulate scanning
  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 87) {
          setScanning(false);
          setScanComplete(true);
          return 87;
        }
        return prev + Math.random() * 15;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [scanning]);

  const handleStartScan = () => {
    setScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: "user",
        text: "Scan my store for issues",
      },
      {
        id: Date.now() + 1,
        sender: "klara",
        text: "Starting comprehensive store scan...",
        isThinking: true,
        action: "scanning",
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Simulate agent thinking
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "klara",
          text: "Processing your request...",
          isThinking: true,
        },
      ]);
    }, 300);

    // Simulate agent response
    setTimeout(() => {
      const response =
        "I've analyzed your request. Would you like me to fix the product images first, or focus on SEO metadata?";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: updated[updated.length - 1].id,
          sender: "klara",
          text: response,
        };
        return updated;
      });
    }, 2500);
  };

  const handleApplyFix = (categoryId) => {
    const category = scanCategories.find((c) => c.id === categoryId);
    if (!category) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: "user",
        text: `Fix all ${category.title} issues`,
      },
      {
        id: Date.now() + 1,
        sender: "klara",
        text: `Fixing ${category.issues} ${category.title.toLowerCase()} issues...`,
        isThinking: true,
        action: "fixing",
      },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "klara",
          text: `✓ Successfully fixed all ${category.issues} ${category.title.toLowerCase()} issues. Your store is now optimized!`,
        },
      ]);
    }, 3000);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "warning":
        return "🟡";
      case "info":
        return "🔵";
      default:
        return "⚪";
    }
  };

  return (
    <Page title="360 Store Scan" fullWidth>
      <div className={styles.dashboard360}>
        {/* Fairy Dust Effect */}
        {scanning && <FairyDustEffect active={scanning} />}

        {/* Main Content - Two Column Layout */}
        <div className={styles.mainContent}>
          {/* Left Column - Categories and Before/After */}
          <div className={styles.leftColumn}>
            {/* Progress */}
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                {scanProgress.toFixed(0)}% Complete
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Category Cards Grid - 4 columns */}
            <div className={styles.categoryGrid}>
              {scanCategories.map((category) => (
                <Card key={category.id} sectioned>
                  <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                      <h3 className={styles.categoryTitle}>{category.title}</h3>
                      <span className={styles.categoryIcon}>{category.icon}</span>
                    </div>
                    <div className={styles.categoryIssues}>
                      <div className={styles.issueCount}>{category.issues}</div>
                      <div className={styles.issueLabel}>{category.issuesLabel}</div>
                    </div>

                    {/* Expandable Details */}
                    {expandedCategory === category.id && (
                      <div className={styles.categoryDetails}>
                        {category.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className={`${styles.detailItem} ${getSeverityColor(
                              detail.severity
                            )}`}
                          >
                            <span>{getSeverityIcon(detail.severity)}</span>
                            <span>{detail.text}</span>
                          </div>
                        ))}
                        <Button
                          onClick={() => handleApplyFix(category.id)}
                          primary
                          fullWidth
                        >
                          Fix These Issues
                        </Button>
                      </div>
                    )}

                    <Button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.id ? null : category.id
                        )
                      }
                      plain
                      fullWidth
                    >
                      {expandedCategory === category.id ? "Hide" : "View"} Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            {scanComplete && (
              <div className={styles.actionButtons}>
                <Button primary onClick={handleStartScan}>
                  Apply All Fixes
                </Button>
                <Button onClick={() => navigate("/app/visuals")}>
                  Preview All Changes
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Scan Visualization */}
          <div className={styles.rightColumn}>
            <ScanVisualization progress={scanProgress} isScanning={scanning} />
          </div>
        </div>

        {/* New Scan Button */}
        <div className={styles.scanButtonContainer}>
          <Button
            onClick={handleStartScan}
            disabled={scanning}
            primary
            size="large"
          >
            {scanning ? "Scanning..." : "Start New Scan"}
          </Button>
        </div>

        {/* Chat Section */}
        <Card title="Agent Chat" sectioned>
          <div className={styles.chatContainer}>
            <div className={styles.messages}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${styles[msg.sender]}`}
                >
                  {msg.isThinking ? (
                    <AgentThinking message={msg.text} />
                  ) : (
                    <div className={styles.messageContent}>{msg.text}</div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Message Klara..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className={styles.input}
              />
              <Button onClick={handleSendMessage} primary>
                Send
              </Button>
            </div>

            {/* Census/Stats */}
            <div className={styles.stats}>
              <CensusStats />
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}

export default Dashboard360;
