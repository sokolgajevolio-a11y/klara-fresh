import { NavLink } from "react-router";
import styles from "./MainNav.module.css";

export function MainNav() {
  const navItems = [
    { path: "/app", label: "Dashboard", icon: "📊", exact: true },
    { path: "/app/scan", label: "360° Scan", icon: "🔍" },
    { path: "/app/products", label: "Products", icon: "📦" },
    { path: "/app/collections", label: "Collections", icon: "📚" },
    { path: "/app/seo", label: "SEO Audit", icon: "🎯" },
    { path: "/app/performance", label: "Performance", icon: "⚡" },
    { path: "/app/issues", label: "Issues", icon: "🔧" },
    { path: "/app/fix-history", label: "Fix History", icon: "📜" },
    { path: "/app/klara", label: "Klara AI", icon: "🤖" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>Klara AI</span>
        </div>
      </div>

      <div className={styles.menu}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.storeInfo}>
          <div className={styles.storeName}>Store Health</div>
          <div className={styles.storeScore}>85%</div>
        </div>
      </div>
    </nav>
  );
}
