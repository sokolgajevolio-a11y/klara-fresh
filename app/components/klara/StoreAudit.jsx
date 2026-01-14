import { Card, Button, Badge, Text, InlineStack, BlockStack, ProgressBar } from "@shopify/polaris";
import { useState, useEffect } from "react";
import styles from "./StoreAudit.module.css";

export default function StoreAudit({ onClose }) {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate audit data loading
    setTimeout(() => {
      setAuditData({
        overallScore: 87,
        categories: [
          {
            name: "Product Quality",
            score: 92,
            issues: 3,
            recommendations: [
              "Add high-quality images to 3 products",
              "Improve product descriptions for better SEO",
            ],
          },
          {
            name: "Store Performance",
            score: 85,
            issues: 5,
            recommendations: [
              "Optimize images for faster loading",
              "Enable lazy loading on product pages",
            ],
          },
          {
            name: "SEO Optimization",
            score: 78,
            issues: 8,
            recommendations: [
              "Add meta descriptions to 8 products",
              "Improve URL structure for collections",
            ],
          },
          {
            name: "User Experience",
            score: 88,
            issues: 2,
            recommendations: [
              "Improve mobile navigation",
              "Add product filters to collections",
            ],
          },
          {
            name: "Security & Compliance",
            score: 95,
            issues: 0,
            recommendations: ["Your store is secure and compliant"],
          },
        ],
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className={styles.storeAudit}>
        <div className={styles.loading}>Loading audit...</div>
      </div>
    );
  }

  return (
    <div className={styles.storeAudit}>
      <div className={styles.header}>
        <h2>Store Audit Report</h2>
        <p>Comprehensive analysis of your Shopify store</p>
      </div>

      <Card sectioned>
        <div className={styles.overallScore}>
          <div className={styles.scoreValue}>{auditData.overallScore}</div>
          <div className={styles.scoreLabel}>Overall Score</div>
          <div className={styles.scoreDescription}>
            Your store is performing well. Focus on the recommendations below to
            improve further.
          </div>
        </div>
      </Card>

      <div className={styles.categoriesList}>
        {auditData.categories.map((category) => (
          <Card key={category.name} sectioned>
            <BlockStack gap="300">
              <InlineStack gap="200" blockAlign="center">
                <div className={styles.categoryScore}>
                  <div className={styles.scoreNumber}>{category.score}</div>
                </div>
                <div className={styles.categoryInfo}>
                  <Text variant="headingMd" as="h3">
                    {category.name}
                  </Text>
                  <Text variant="bodySm" tone="subdued">
                    {category.issues} issues found
                  </Text>
                </div>
              </InlineStack>

              <ProgressBar progress={category.score} />

              <div className={styles.recommendations}>
                <Text variant="headingSm" as="h4">
                  Recommendations:
                </Text>
                <ul className={styles.recommendationsList}>
                  {category.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              {category.issues > 0 && (
                <Button onClick={() => {}}>Fix Issues</Button>
              )}
            </BlockStack>
          </Card>
        ))}
      </div>

      <div className={styles.footer}>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}


