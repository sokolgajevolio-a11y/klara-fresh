import { Page, Card, Text, Button, Badge, TextField, InlineStack, BlockStack, Spinner } from "@shopify/polaris";
import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Fetch content-related issues
    const issues = await prisma.issue.findMany({
      where: {
        shop,
        status: "open",
        category: "Content & SEO",
      },
      orderBy: [
        { severity: "desc" },
        { createdAt: "desc" },
      ],
    });

    return {
      issues: issues.map(issue => ({
        id: issue.id,
        entityId: issue.entityId,
        productTitle: issue.productTitle,
        issueType: issue.issueType,
        severity: issue.severity,
        title: issue.title || `${issue.productTitle} - ${issue.issueType}`,
        proposedFix: issue.proposedFix,
      })),
    };
  } catch (error) {
    console.error("Failed to load content issues:", error);
    return { issues: [] };
  }
}

export default function Content() {
  const { issues: initialIssues } = useLoaderData();
  const [issues, setIssues] = useState(initialIssues);
  const [editingId, setEditingId] = useState(null);
  const [editedContent, setEditedContent] = useState({});
  const fetcher = useFetcher();

  const getFieldName = (issueType) => {
    if (issueType.includes('description')) return 'Description';
    if (issueType.includes('seo_description')) return 'SEO Description';
    if (issueType.includes('seo_title')) return 'SEO Title';
    return 'Content';
  };

  const handleApply = async (issue) => {
    const formData = new FormData();
    formData.append("issueId", issue.id);
    formData.append("fixData", editedContent[issue.id] || issue.proposedFix || '');
    
    fetcher.submit(formData, { method: "POST", action: "/api/fix" });
    
    // Remove from list after applying
    setTimeout(() => {
      setIssues(prev => prev.filter(i => i.id !== issue.id));
    }, 500);
  };

  const handleEdit = (issue) => {
    setEditingId(issue.id);
    setEditedContent({ ...editedContent, [issue.id]: issue.proposedFix || '' });
  };

  const handleSave = (issue) => {
    setEditingId(null);
    // Content is already saved in state, just close editor
  };

  const handleRegenerate = async (issue) => {
    try {
      const response = await fetch('/api/propose-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: issue.id }),
      });
      
      const data = await response.json();
      if (data.success && data.proposedFix) {
        setEditedContent({ ...editedContent, [issue.id]: data.proposedFix });
        setIssues(prev => prev.map(i => 
          i.id === issue.id ? { ...i, proposedFix: data.proposedFix } : i
        ));
      }
    } catch (error) {
      console.error('Failed to regenerate:', error);
    }
  };

  const isLoading = fetcher.state !== "idle";

  return (
    <Page title="Content & SEO">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2">Content Issues</Text>
              <Badge tone={issues.length > 0 ? "critical" : "success"}>
                {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
              </Badge>
            </InlineStack>

            {issues.length === 0 ? (
              <Text variant="bodyMd" tone="subdued">
                No content issues found. Your product content is well-optimized!
              </Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {issues.map((issue) => (
                  <div key={issue.id} style={{ 
                    background: '#0a0a0a', 
                    border: '1px solid #1a1a1a', 
                    borderRadius: '8px', 
                    padding: '16px' 
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <InlineStack gap="200" wrap={false}>
                        <Text variant="bodyMd" fontWeight="semibold">
                          {issue.productTitle} • {getFieldName(issue.issueType)}
                        </Text>
                        <Badge tone={
                          issue.severity === "critical" ? "critical" : 
                          issue.severity === "high" ? "warning" : "info"
                        }>
                          {issue.severity}
                        </Badge>
                      </InlineStack>
                    </div>
                    
                    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Text variant="bodySm" tone="subdued">
                        Issue: {issue.issueType.replace(/_/g, ' ')}
                      </Text>
                      
                      {/* Proposed Fix */}
                      <div>
                        <Text variant="bodySm" fontWeight="semibold" tone="subdued">Proposed Fix</Text>
                        {editingId === issue.id ? (
                          <TextField
                            value={editedContent[issue.id] || issue.proposedFix || ''}
                            onChange={(value) => setEditedContent({ ...editedContent, [issue.id]: value })}
                            multiline={4}
                            autoComplete="off"
                          />
                        ) : (
                          <div style={{ 
                            background: '#000', 
                            border: '1px solid #1a1a1a', 
                            borderRadius: '6px', 
                            padding: '12px', 
                            minHeight: '80px',
                            marginTop: '8px'
                          }}>
                            <Text variant="bodySm">
                              {editedContent[issue.id] || issue.proposedFix || 'AI will generate suggestion...'}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #1a1a1a' }}>
                      {editingId === issue.id ? (
                        <>
                          <Button primary onClick={() => handleSave(issue)}>Save</Button>
                          <Button onClick={() => setEditingId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button primary onClick={() => handleApply(issue)} loading={isLoading}>
                            Apply
                          </Button>
                          <Button onClick={() => handleEdit(issue)}>Edit</Button>
                          <Button onClick={() => handleRegenerate(issue)}>Regenerate</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
