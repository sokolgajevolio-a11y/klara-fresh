import { useState } from "react";
import { authenticate } from "../shopify.server";
import { 
  Button, 
  Badge,
  Text,
  BlockStack,
  Spinner
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {};
};

export default function Home() {
  const [chatHistory, setChatHistory] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm Klara, your AI Shopify Store Operator. I can scan your entire store for issues. What would you like me to do?",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 360° Scan Results
  const scanResults = [
    {
      category: "Product Images",
      color: "#60a5fa",
      issues: 47,
      problems: [
        {
          title: "Low-quality images",
          severity: "critical",
          count: 23,
          description: "Products with blurry or low-resolution images",
        },
        {
          title: "Missing alt text",
          severity: "warning",
          count: 18,
          description: "Images without proper alt descriptions for SEO",
        },
        {
          title: "Inconsistent styling",
          severity: "info",
          count: 12,
          description: "Images with different backgrounds or lighting",
        },
      ],
    },
    {
      category: "Product Descriptions",
      color: "#4ade80",
      issues: 34,
      problems: [
        {
          title: "Too short descriptions",
          severity: "warning",
          count: 19,
          description: "Descriptions under 50 words",
        },
        {
          title: "Missing keywords",
          severity: "warning",
          count: 12,
          description: "No relevant search terms",
        },
        {
          title: "Duplicate content",
          severity: "info",
          count: 3,
          description: "Identical descriptions across products",
        },
      ],
    },
    {
      category: "SEO & Metadata",
      color: "#facc15",
      issues: 56,
      problems: [
        {
          title: "Missing SEO titles",
          severity: "critical",
          count: 28,
          description: "Products without optimized titles",
        },
        {
          title: "Duplicate meta descriptions",
          severity: "warning",
          count: 18,
          description: "Multiple products with same meta description",
        },
        {
          title: "Keyword cannibalization",
          severity: "info",
          count: 10,
          description: "Multiple products targeting same keywords",
        },
      ],
    },
    {
      category: "Store Structure",
      color: "#a78bfa",
      issues: 22,
      problems: [
        {
          title: "Orphaned products",
          severity: "warning",
          count: 8,
          description: "Products not in any collection",
        },
        {
          title: "Empty collections",
          severity: "info",
          count: 6,
          description: "Collections with no products",
        },
        {
          title: "Navigation issues",
          severity: "warning",
          count: 8,
          description: "Broken or confusing category paths",
        },
      ],
    },
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: String(chatHistory.length + 1),
      role: "user",
      content: inputValue,
    };

    setChatHistory([...chatHistory, userMessage]);
    setInputValue("");

    // Simulate Klara's response
    setTimeout(() => {
      let response = "";
      const input = inputValue.toLowerCase();

      if (input.includes("scan") || input.includes("check") || input.includes("analyze")) {
        response = "I'll start a 360° scan of your entire store now. This will check all products, images, descriptions, SEO, and structure. Give me a moment...";
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
        }, 3000);
      } else if (input.includes("fix") || input.includes("apply")) {
        response = "I can fix these issues for you. Which category would you like me to focus on first? I can improve images, descriptions, SEO, or structure.";
      } else {
        response = "I can help you optimize your store. Try asking me to 'scan my store' or 'fix problems' to get started.";
      }

      const assistantMessage = {
        id: String(chatHistory.length + 2),
        role: "assistant",
        content: response,
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleNewChat = () => {
    setChatHistory([
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm Klara, your AI Shopify Store Operator. I can scan your entire store for issues. What would you like me to do?",
      },
    ]);
    setScanComplete(false);
    setSelectedCategory(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return { background: "rgba(239, 68, 68, 0.2)", text: "#fca5a5", border: "rgba(239, 68, 68, 0.3)" };
      case "warning":
        return { background: "rgba(234, 179, 8, 0.2)", text: "#fde047", border: "rgba(234, 179, 8, 0.3)" };
      case "info":
        return { background: "rgba(59, 130, 246, 0.2)", text: "#93c5fd", border: "rgba(59, 130, 246, 0.3)" };
      default:
        return { background: "rgba(107, 114, 128, 0.2)", text: "#d1d5db", border: "rgba(107, 114, 128, 0.3)" };
    }
  };

  const handleStartScan = () => {
    setInputValue("Scan my store");
    setTimeout(() => {
      const userMsg = {
        id: String(chatHistory.length + 1),
        role: "user",
        content: "Scan my store",
      };
      setChatHistory([...chatHistory, userMsg]);
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
      }, 3000);
    }, 100);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", color: "#f5f5f5" }}>
      {/* Sidebar Chat */}
      <div style={{ 
        width: "320px", 
        borderRight: "1px solid #1a1a1a", 
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid #1a1a1a" }}>
          <Button onClick={handleNewChat} fullWidth>
            + New Scan
          </Button>
        </div>

        {/* Chat Messages */}
        <div style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {chatHistory.map((msg) => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Text variant="bodySm" as="p" fontWeight="semibold" tone="subdued">
                {msg.role === "user" ? "You" : "Klara"}
              </Text>
              <div style={{
                padding: "12px",
                borderRadius: "8px",
                background: msg.role === "user" ? "#ffffff" : "#1a1a1a",
                color: msg.role === "user" ? "#000" : "#e5e5e5"
              }}>
                <Text variant="bodySm" as="p">
                  {msg.content}
                </Text>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: "16px", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ 
            display: "flex", 
            gap: "8px",
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            padding: "8px"
          }}>
            <input
              type="text"
              placeholder="Ask Klara..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#e5e5e5",
                fontSize: "14px",
                padding: "8px"
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: "#ffffff",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#000" }}>
        {/* Top Bar */}
        <div style={{ 
          borderBottom: "1px solid #1a1a1a", 
          background: "#000", 
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <Text variant="heading2xl" as="h1" fontWeight="bold">
              Klara
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              AI Store Operator
            </Text>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {isScanning ? (
            // Scanning State
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              height: "100%",
              gap: "24px"
            }}>
              <Spinner size="large" />
              <div style={{ textAlign: "center" }}>
                <Text variant="headingLg" as="h2" fontWeight="bold">
                  Scanning Your Store
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Analyzing products, images, SEO, content, and structure...
                </Text>
              </div>
            </div>
          ) : scanComplete ? (
            // Scan Results
            <BlockStack gap="600">
              <div>
                <Text variant="headingLg" as="h2" fontWeight="bold">
                  360° Store Scan Results
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Found {scanResults.reduce((sum, r) => sum + r.issues, 0)} issues across your store
                </Text>
              </div>

              {/* Category Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {scanResults.map((result) => {
                  const isSelected = selectedCategory === result.category;

                  return (
                    <button
                      key={result.category}
                      onClick={() => setSelectedCategory(isSelected ? null : result.category)}
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        borderRadius: "8px",
                        border: isSelected ? "1px solid #fff" : "1px solid #1a1a1a",
                        background: isSelected ? "rgba(255, 255, 255, 0.05)" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div style={{ 
                          width: "24px", 
                          height: "24px", 
                          background: result.color,
                          borderRadius: "4px"
                        }} />
                        <Badge tone="critical">{result.issues} issues</Badge>
                      </div>
                      <Text variant="bodyLg" as="h3" fontWeight="bold">
                        {result.category}
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        Click to view details
                      </Text>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Problems */}
              {selectedCategory && (
                <BlockStack gap="400">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text variant="headingMd" as="h3" fontWeight="bold">
                      {selectedCategory} - Issues Found
                    </Text>
                    <Button plain onClick={() => setSelectedCategory(null)}>
                      ✕
                    </Button>
                  </div>

                  {scanResults
                    .find((r) => r.category === selectedCategory)
                    ?.problems.map((problem, idx) => {
                      const colors = getSeverityColor(problem.severity);
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "16px",
                            borderRadius: "8px",
                            background: colors.background,
                            border: `1px solid ${colors.border}`,
                            color: colors.text
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                            <Text variant="bodyMd" as="h4" fontWeight="bold">
                              {problem.title}
                            </Text>
                            <Text variant="bodySm" as="span" fontWeight="bold">
                              {problem.count} found
                            </Text>
                          </div>
                          <Text variant="bodySm" as="p" tone="subdued">
                            {problem.description}
                          </Text>
                          <div style={{ marginTop: "12px" }}>
                            <Button fullWidth>
                              ⚡ Fix These Issues
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </BlockStack>
              )}
            </BlockStack>
          ) : (
            // Initial State
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              height: "100%",
              gap: "24px",
              textAlign: "center"
            }}>
              <div>
                <Text variant="heading2xl" as="h2" fontWeight="bold">
                  Welcome to Klara
                </Text>
                <Text variant="bodyLg" as="p" tone="subdued">
                  Your AI Shopify Store Operator
                </Text>
              </div>

              <div style={{ maxWidth: "500px" }}>
                <Text variant="bodyMd" as="p" tone="subdued" alignment="center">
                  Select the areas you want to scan, then click Start:
                </Text>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "16px", 
                  marginTop: "24px"
                }}>
                  {[
                    { label: "Product Images" },
                    { label: "Descriptions" },
                    { label: "SEO & Metadata" },
                    { label: "Store Structure" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "#0a0a0a",
                        border: "1px solid #2a2a2a",
                        padding: "16px",
                        borderRadius: "8px",
                        textAlign: "center",
                        transition: "all 0.2s",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#fff";
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#2a2a2a";
                        e.currentTarget.style.background = "#0a0a0a";
                      }}
                    >
                      <Text variant="bodySm" as="span">
                        {item.label}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleStartScan} primary size="large">
                ⚡ Start 360° Scan
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
