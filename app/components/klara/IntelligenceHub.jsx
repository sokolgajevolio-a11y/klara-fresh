import { Tabs } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import styles from "./IntelligenceHub.module.css";

export default function IntelligenceHub({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine selected tab based on current route
  const getSelectedTab = () => {
    if (location.pathname.includes('/visuals')) return 0;
    if (location.pathname.includes('/content')) return 1;
    if (location.pathname.includes('/structure')) return 2;
    if (location.pathname.includes('/operations')) return 3;
    return 0;
  };

  const [selected, setSelected] = useState(getSelectedTab());

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelected(selectedTabIndex);
    const routes = ['/app/visuals', '/app/content', '/app/structure', '/app/operations'];
    navigate(routes[selectedTabIndex]);
  }, [navigate]);

  const tabs = [
    {
      id: 'visuals',
      content: 'Visuals',
      accessibilityLabel: 'Visuals',
    },
    {
      id: 'content',
      content: 'Content',
      accessibilityLabel: 'Content',
    },
    {
      id: 'structure',
      content: 'Structure',
      accessibilityLabel: 'Structure',
    },
    {
      id: 'operations',
      content: 'Operations',
      accessibilityLabel: 'Operations',
    },
  ];

  return (
    <div className={styles.intelligenceHub}>
      <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
        <div className={styles.tabContent}>
          {children}
        </div>
      </Tabs>
    </div>
  );
}
