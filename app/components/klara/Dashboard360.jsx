import { Page, Card, Button, Badge, Text, InlineStack, BlockStack, Layout } from "@shopify/polaris";
import { useState, useEffect } from "react";
import ScanVisualization from "./ScanVisualization";
import AgentThinking from "./AgentThinking";
import CensusStats from "./CensusStats";

export default function Dashboard360() {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "assistant",
      content: "Hi! I'm Klara, your AI Shopify Store Operator. I can scan your entire store for issues. What would you like me to do?",
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
      details: [
        { severity: "critical", text: "13 products missing alt text" },
        { severity: "warning", text: "8 images below 1000px width" },
      ],
    },
    {
      id: 2,
      title: "Descriptions",
      icon: "✍️",
      issues: 8,
      details: [
        { severity: "critical", text: "8 products with duplicate descriptions" },
        { severity: "warning", text: "12 descriptions under 50 characters" },
      ],
    },
    {
      id: 3,
      title: "SEO Metadata",
      icon: "🔗",
      issues: 6,
      details: [
        { severity: "critical", text: "6 products missing meta descriptions" },
        { severity: "warning", text: "4 titles over 60 characters" },
      ],
    },
    {
      id: 4,
      title: "Store Structure",
      icon: "📊",
      issues: 3,
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
        content: "Scan my store",
      },
      {
        id: Date.now() + 1,
        sender: "assistant",
        content: "Starting comprehensive store scan...",
        isThinking: true,
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      content: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          content: "I've analyzed your request. Would you like me to fix the product images first?",
        },
      ]);
    }, 1500);
  };

  const getSeverityBadge = (severity) => {
    const badgeConfig = {
      critical: { status: "critical", children: "Critical" },
      warning: { status: "warning", children: "Warning" },
      info: { status: "info", children: "Info" },
    };
    return badgeConfig[severity] || badgeConfig.info;
  };

  return (
    <Page title="360 Store Scan" fullWidth>
      <Layout>
        {/* Main Content Section */}
        <Layout.Section>
          <BlockStack gap="400">
            {/* Progress Bar */}
            {scanning && (
              <Card>
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="semibold">
                    Scanning: {scanProgress.toFixed(0)}% Complete
                  </Text>
                  <div style={{
                    width: "100%",
                    height: "8px",
                    background: "#e5e7eb",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${scanProgress}%`,
                      height: "100%",
                      background: "#22d3ee",
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </BlockStack>
              </Card>
            )}

            {/* Category Cards Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}>
              {scanCategories.map((category) => (
                <Card key={category.id}>
                  <BlockStack gap="300">
                    <InlineStack blockAlign="center" gap="200">
                      <Text variant="headingMd" as="h3">
                        {category.icon} {category.title}
                      </Text>
                    </InlineStack>

                    <div style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#22d3ee",
                    }}>
                      {category.issues}
                    </div>

                    <Text variant="bodySm" tone="subdued">
                      issues found
                    </Text>

                    {expandedCategory === category.id && (
                      <BlockStack gap="200">
                        {category.details.map((detail, idx) => (
                          <InlineStack key={idx} gap="200" blockAlign="start">
                            <Badge {...getSeverityBadge(detail.severity)} />
                            <Text variant="bodySm">{detail.text}</Text>
                          </InlineStack>
                        ))}
                        <Button primary fullWidth>
                          Fix These Issues
                        </Button>
                      </BlockStack>
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
                  </BlockStack>
                </Card>
              ))}
            </div>

            {/* Scan Visualization */}
            <Card>
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <ScanVisualization progress={scanProgress} isScanning={scanning} />
              </div>
            </Card>

            {/* Scan Button */}
            <div style={{ display: "flex", justifyContent: "center" }}>
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
            <Card title="Chat with Klara">
              <BlockStack gap="300">
                {/* Messages */}
                <div style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  padding: "12px 0",
                }}>
                  {messages.map((msg) => (
                    <div key={msg.id} style={{
                      display: "flex",
                      justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    }}>
                      <div style={{
                        maxWidth: "70%",
                        padding: "12px",
                        borderRadius: "8px",
                        background: msg.sender === "user" ? "#0891b2" : "#e5e7eb",
                        color: msg.sender === "user" ? "#fff" : "#000",
                      }}>
                        {msg.isThinking ? (
                          <AgentThinking message={msg.content} />
                        ) : (
                          <Text variant="bodySm">{msg.content}</Text>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <InlineStack gap="200">
                  <input
                    type="text"
                    placeholder="Message Klara..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                  <Button onClick={handleSendMessage} primary>
                    Send
                  </Button>
                </InlineStack>

                {/* Stats */}
                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                  <CensusStats />
                </div>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
