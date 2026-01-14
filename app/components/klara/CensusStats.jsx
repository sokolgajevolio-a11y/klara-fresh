import { InlineStack, Text } from "@shopify/polaris";
import styles from "./CensusStats.module.css";

export default function CensusStats() {
  const stats = [
    {
      id: 1,
      label: "Store Health",
      value: "87/100",
      icon: "🟢",
      color: "green",
    },
    {
      id: 2,
      label: "Total Products",
      value: "2,847",
      icon: "📦",
      color: "blue",
    },
    {
      id: 3,
      label: "Issues Found",
      value: "31",
      icon: "🔴",
      color: "red",
    },
    {
      id: 4,
      label: "Image Quality",
      value: "72/100",
      icon: "🖼️",
      color: "purple",
    },
    {
      id: 5,
      label: "SEO Score",
      value: "68/100",
      icon: "🔗",
      color: "orange",
    },
  ];

  return (
    <div className={styles.censusStats}>
      <Text variant="headingMd" as="h3">
        Census/Stats
      </Text>
      <div className={styles.statsList}>
        {stats.map((stat) => (
          <div key={stat.id} className={`${styles.stat} ${styles[stat.color]}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


