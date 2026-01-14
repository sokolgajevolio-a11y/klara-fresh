import { Page, Card, Text, Badge, Spinner, BlockStack, InlineStack } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { ImageFixCard } from "../components/ImageFixCard";

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Fetch image-related issues
    const issues = await prisma.issue.findMany({
      where: {
        shop,
        status: "open",
        category: "Images",
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
      })),
    };
  } catch (error) {
    console.error("Failed to load visual issues:", error);
    return { issues: [] };
  }
}

export default function Visuals() {
  const { issues: initialIssues } = useLoaderData();
  const [issues, setIssues] = useState(initialIssues);
  const [loading, setLoading] = useState(false);

  const handleFixed = (issueId) => {
    // Remove the fixed issue from the list
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  const handleRunScan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scan', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        // Reload the page to get fresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Visual Consistency"
      primaryAction={{
        content: 'Run Scan',
        onAction: handleRunScan,
        loading,
      }}
    >
      <BlockStack gap="400">
        {/* Summary Card */}
        <Card>
          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h2">Image Issues</Text>
              <Badge tone={issues.length > 0 ? "critical" : "success"}>
                {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
              </Badge>
            </InlineStack>
            {issues.length === 0 && (
              <Text variant="bodyMd" tone="subdued">
                No image issues found. Your store images are in good shape!
              </Text>
            )}
          </BlockStack>
        </Card>

        {/* Issue Cards */}
        {issues.map((issue) => (
          <ImageFixCard
            key={issue.id}
            issue={issue}
            onFixed={handleFixed}
          />
        ))}
      </BlockStack>
    </Page>
  );
}
