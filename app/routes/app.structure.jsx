import { Page, Card, Text, Button, Badge, InlineStack, BlockStack } from "@shopify/polaris";
import { useState } from "react";

export default function Structure() {
  // Sample data - replace with real data from API
  const structureIssues = [
    { 
      id: 1, 
      type: "collection", 
      name: "Summer Collection",
      issue: "Only 3 products (recommend 8-12)", 
      severity: "warning",
      action: "Add more products or merge with 'Beach Essentials'"
    },
    { 
      id: 2, 
      type: "navigation", 
      name: "Main Menu",
      issue: "5 uncategorized products not in navigation", 
      severity: "critical",
      action: "Create 'New Arrivals' collection and add to menu"
    },
    { 
      id: 3, 
      type: "merchandising", 
      name: "Best Sellers",
      issue: "Products not sorted by sales", 
      severity: "info",
      action: "Re-order by actual sales data"
    },
  ];

  const collections = [
    { 
      id: 1, 
      name: "Summer Collection", 
      products: ["Summer Dress", "Canvas Tote", "Sunglasses"],
      recommended: ["Beach Hat", "Sandals", "Swimsuit", "Sun Lotion", "Beach Towel"]
    },
    { 
      id: 2, 
      name: "Best Sellers", 
      products: ["Leather Wallet", "Canvas Tote", "Summer Dress", "Classic Watch"],
      currentOrder: "manual",
      recommendedOrder: "by sales volume"
    },
  ];

  const handleApplyFix = (issue) => {
    console.log("Applying fix for:", issue);
    // Wire to actual fix logic
  };

  const handleReorder = (collectionId) => {
    console.log("Reordering collection:", collectionId);
    // Wire to reorder logic
  };

  const handleAddProducts = (collection) => {
    console.log("Adding products to:", collection);
    // Wire to add products logic
  };

  const handleUndo = (issueId) => {
    console.log("Undoing fix for:", issueId);
    // Wire to undo logic
  };

  return (
    <Page title="Structure & Merchandising">
      <BlockStack gap="400">
        {/* Structure Issues */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2">Structure Issues</Text>
              <Badge tone="critical">{structureIssues.length} issues</Badge>
            </InlineStack>

            <div className={styles.issuesList}>
              {structureIssues.map((issue) => (
                <div key={issue.id} className={styles.issueCard}>
                  <div className={styles.issueHeader}>
                    <InlineStack gap="200" wrap={false}>
                      <Text variant="bodyMd" fontWeight="semibold">{issue.name}</Text>
                      <Badge tone={
                        issue.severity === "critical" ? "critical" : 
                        issue.severity === "warning" ? "warning" : "info"
                      }>
                        {issue.severity}
                      </Badge>
                      <Badge>{issue.type}</Badge>
                    </InlineStack>
                  </div>
                  
                  <div className={styles.issueContent}>
                    <Text variant="bodySm" tone="subdued">Issue: {issue.issue}</Text>
                    <Text variant="bodySm">Suggested fix: {issue.action}</Text>
                  </div>

                  <div className={styles.issueActions}>
                    <Button onClick={() => handleApplyFix(issue)}>Apply</Button>
                    <Button variant="plain" onClick={() => handleUndo(issue.id)}>Undo</Button>
                  </div>
                </div>
              ))}
            </div>
          </BlockStack>
        </Card>

        {/* Collections Management */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Collections</Text>

            <div className={styles.collectionsList}>
              {collections.map((collection) => (
                <div key={collection.id} className={styles.collectionCard}>
                  <div className={styles.collectionHeader}>
                    <Text variant="bodyMd" fontWeight="semibold">{collection.name}</Text>
                    <Badge>{collection.products.length} products</Badge>
                  </div>
                  
                  <div className={styles.collectionContent}>
                    {/* Current Products */}
                    <div className={styles.productsSection}>
                      <Text variant="bodySm" fontWeight="semibold" tone="subdued">Current Products</Text>
                      <div className={styles.productsList}>
                        {collection.products.map((product, idx) => (
                          <div key={idx} className={styles.productTag}>
                            <span className={styles.productNumber}>{idx + 1}</span>
                            {product}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Products (if any) */}
                    {collection.recommended && (
                      <div className={styles.productsSection}>
                        <Text variant="bodySm" fontWeight="semibold" tone="subdued">Recommended to Add</Text>
                        <div className={styles.productsList}>
                          {collection.recommended.map((product, idx) => (
                            <div key={idx} className={styles.productTag + ' ' + styles.recommended}>
                              {product}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ordering info */}
                    {collection.currentOrder && (
                      <div className={styles.orderingInfo}>
                        <Text variant="bodySm" tone="subdued">
                          Current order: {collection.currentOrder}
                        </Text>
                        <Text variant="bodySm" tone="subdued">
                          Recommended: {collection.recommendedOrder}
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className={styles.collectionActions}>
                    <Button onClick={() => handleReorder(collection.id)}>Reorder</Button>
                    {collection.recommended && (
                      <Button onClick={() => handleAddProducts(collection)}>Add Products</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
