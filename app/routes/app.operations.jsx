import { Page, Card, Text, Button, Badge, InlineStack, BlockStack } from "@shopify/polaris";
import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Fetch fix history
    const fixes = await prisma.fixHistory.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      fixes: fixes.map(fix => ({
        id: fix.id,
        action: fix.action,
        issueType: fix.issueType,
        productTitle: fix.productTitle,
        createdAt: fix.createdAt,
        undone: fix.undone,
        canUndo: !fix.undone && fix.beforeSnapshot,
      })),
    };
  } catch (error) {
    console.error("Failed to load fix history:", error);
    return { fixes: [] };
  }
}

export default function Operations() {
  const { fixes: initialFixes } = useLoaderData();
  const [fixes, setFixes] = useState(initialFixes);
  const [filter, setFilter] = useState("all");
  const fetcher = useFetcher();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const filteredFixes = fixes.filter(fix => {
    if (filter === "all") return true;
    if (filter === "applied") return !fix.undone;
    if (filter === "undone") return fix.undone;
    return true;
  });

  const handleUndo = async (fix) => {
    const formData = new FormData();
    formData.append("fixId", fix.id);
    
    fetcher.submit(formData, { method: "POST", action: "/api/undo" });
    
    // Update UI optimistically
    setFixes(prev => prev.map(f => 
      f.id === fix.id ? { ...f, undone: true, canUndo: false } : f
    ));
  };

  const handleClearHistory = async () => {
    if (!confirm("Clear all fix history? This cannot be undone.")) return;
    
    try {
      await fetch('/api/history/clear', { method: 'POST' });
      setFixes([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  return (
    <Page title="Operations & Audit">
      <BlockStack gap="400">
        {/* Audit Trail */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2">Audit Trail</Text>
              <InlineStack gap="200">
                <Button size="slim" pressed={filter === "all"} onClick={() => setFilter("all")}>All</Button>
                <Button size="slim" pressed={filter === "applied"} onClick={() => setFilter("applied")}>Applied</Button>
                <Button size="slim" pressed={filter === "undone"} onClick={() => setFilter("undone")}>Undone</Button>
              </InlineStack>
            </InlineStack>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filteredFixes.length > 0 ? filteredFixes.map((fix) => (
                <div key={fix.id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    marginTop: '6px',
                    flexShrink: 0,
                    background: fix.undone ? '#666' : '#4caf50'
                  }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <Text variant="bodyMd" fontWeight="semibold">{fix.productTitle}</Text>
                        <Text variant="bodySm" tone="subdued">{formatTime(fix.createdAt)}</Text>
                      </div>
                      <Badge tone={fix.undone ? "info" : "success"}>
                        {fix.undone ? "undone" : "applied"}
                      </Badge>
                    </div>
                    
                    <div>
                      <Text variant="bodySm">
                        <span style={{ fontWeight: 600 }}>{fix.action}</span>: {fix.issueType.replace(/_/g, ' ')}
                      </Text>
                    </div>

                    {fix.canUndo && (
                      <div style={{ marginTop: '4px' }}>
                        <Button size="slim" onClick={() => handleUndo(fix)}>Undo</Button>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <Text variant="bodyMd" tone="subdued">No fix history yet.</Text>
              )}
            </div>

            {fixes.length > 0 && (
              <div style={{ paddingTop: '16px', borderTop: '1px solid #1a1a1a' }}>
                <Button destructive onClick={handleClearHistory}>Clear History</Button>
              </div>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
