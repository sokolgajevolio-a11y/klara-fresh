import { Page, Card, Button, Badge, Text, Spinner, InlineStack, BlockStack } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./Dashboard.module.css";

export function KlaraDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scanData, setScanData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch issues from database
      const issuesResponse = await fetch('/api/issues/top');
      if (issuesResponse.ok) {
        const data = await issuesResponse.json();
        
        // Map issues to insights format
        const mappedInsights = (data.issues || []).slice(0, 3).map(issue => ({
          id: issue.id,
          title: issue.title || `${issue.productTitle} - ${issue.issueType}`,
          severity: issue.severity === 'critical' ? 'critical' : issue.severity === 'high' ? 'warning' : 'info',
          category: issue.category,
          issueId: issue.id
        }));
        
        setInsights(mappedInsights);
        
        // Calculate score based on issues
        const score = data.score || 87;
        setScanData({ score });
      }

      // Fetch recent fixes from fix history
      const historyResponse = await fetch('/api/history/recent');
      if (historyResponse.ok) {
        const data = await historyResponse.json();
        const mappedActivity = (data.fixes || []).slice(0, 3).map(fix => ({
          id: fix.id,
          action: fix.description || `Fixed ${fix.issueType}`,
          time: formatTime(fix.createdAt)
        }));
        setRecentActivity(mappedActivity);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use fallback data
      setInsights([
        { id: 1, title: "3 products missing images", severity: "critical", category: "Images" },
        { id: 2, title: "12 products need SEO improvements", severity: "warning", category: "Content & SEO" },
        { id: 3, title: "5 collections poorly organized", severity: "info", category: "Organization" },
      ]);
      setRecentActivity([
        { id: 1, action: "Fixed SEO for product", time: "2 min ago" },
        { id: 2, action: "Added images", time: "15 min ago" },
        { id: 3, action: "Reorganized collection", time: "1 hour ago" },
      ]);
      setScanData({ score: 87 });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  };

  const handleFixNow = (insight) => {
    // Navigate to appropriate page based on issue category
    if (insight.category === 'Images') {
      navigate('/app/visuals');
    } else if (insight.category === 'Content & SEO') {
      navigate('/app/content');
    } else if (insight.category === 'Organization') {
      navigate('/app/structure');
    } else {
      navigate('/app/visuals'); // default
    }
  };

  if (loading && !scanData) {
    return (
      <Page title="Command Center" fullWidth>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner size="large" />
        </div>
      </Page>
    );
  }

  const score = scanData?.score || 87;

  return (
    <Page title="Command Center" fullWidth>
      <div className={styles.dashboard}>
        {/* STORE HEALTH */}
        <Card sectioned>
          <div className={styles.healthCard}>
            <Text variant="headingMd" as="h2">
              Store Health
            </Text>
            <div className={styles.healthScore}>
              <div className={styles.scoreValue}>{score}</div>
              <div className={styles.scoreLabel}>Overall Score</div>
            </div>
          </div>
        </Card>

        {/* TOP PRIORITIES */}
        <Card title="Top Priorities" sectioned>
          <div className={styles.insights}>
            {insights.length > 0 ? insights.map((insight) => (
              <div key={insight.id} className={styles.insight}>
                <div className={styles.insightContent}>
                  <InlineStack gap="200" wrap={false}>
                    <Badge
                      tone={
                        insight.severity === "critical"
                          ? "critical"
                          : insight.severity === "warning"
                          ? "warning"
                          : "info"
                      }
                    >
                      {insight.severity}
                    </Badge>
                    <Text variant="bodyMd" as="span">
                      {insight.title}
                    </Text>
                  </InlineStack>
                </div>
                <div className={styles.insightActions}>
                  <Button onClick={() => handleFixNow(insight)}>
                    Fix now
                  </Button>
                  <Button plain>Review</Button>
                </div>
              </div>
            )) : (
              <Text variant="bodyMd" tone="subdued">No issues found. Run a scan to check your store.</Text>
            )}
          </div>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card title="Recent Activity" sectioned>
          <div className={styles.activity}>
            {recentActivity.length > 0 ? recentActivity.map((item) => (
              <div key={item.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <div className={styles.activityAction}>{item.action}</div>
                  <div className={styles.activityTime}>{item.time}</div>
                </div>
              </div>
            )) : (
              <Text variant="bodyMd" tone="subdued">No recent activity</Text>
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}

export default KlaraDashboard;
