import { Frame, Navigation, TextField, Button, Icon, Scrollable, InlineStack } from "@shopify/polaris";
import { PlusCircleIcon, SearchIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import styles from "./KlaraLayout.module.css";

export function KlaraLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([
    { id: 1, title: "Fix missing images", status: "active" },
    { id: 2, title: "Improve SEO", status: "completed" },
  ]);

  const handleNewTask = () => {
    navigate("/app");
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    // Process command
    console.log("Klara command:", input);
    setInput("");
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className={styles.klaraLayout}>
      {/* LEFT SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Button onClick={handleNewTask} fullWidth>
            <InlineStack gap="200" blockAlign="center">
              <Icon source={PlusCircleIcon} />
              <span>New Task</span>
            </InlineStack>
          </Button>
        </div>

        <Scrollable className={styles.taskList}>
          {/* Navigation */}
          <div className={styles.navigation}>
            <div className={styles.sectionTitle}>Navigation</div>
            <div 
              className={`${styles.navItem} ${location.pathname === '/app' ? styles.navItemActive : ''}`}
              onClick={() => handleNavigate('/app')}
            >
              Dashboard
            </div>
            <div 
              className={`${styles.navItem} ${location.pathname.includes('/visuals') ? styles.navItemActive : ''}`}
              onClick={() => handleNavigate('/app/visuals')}
            >
              Visuals
            </div>
            <div 
              className={`${styles.navItem} ${location.pathname.includes('/content') ? styles.navItemActive : ''}`}
              onClick={() => handleNavigate('/app/content')}
            >
              Content
            </div>
            <div 
              className={`${styles.navItem} ${location.pathname.includes('/structure') ? styles.navItemActive : ''}`}
              onClick={() => handleNavigate('/app/structure')}
            >
              Structure
            </div>
            <div 
              className={`${styles.navItem} ${location.pathname.includes('/operations') ? styles.navItemActive : ''}`}
              onClick={() => handleNavigate('/app/operations')}
            >
              Operations
            </div>
          </div>

          {/* Tasks */}
          <div className={styles.tasks}>
            <div className={styles.sectionTitle}>Recent Tasks</div>
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`${styles.task} ${task.status === "active" ? styles.taskActive : ""}`}
              >
                <div className={styles.taskTitle}>{task.title}</div>
                <div className={styles.taskStatus}>{task.status}</div>
              </div>
            ))}
          </div>
        </Scrollable>

        <div className={styles.context}>
          <div className={styles.contextLabel}>Context</div>
          <div className={styles.contextValue}>Dashboard</div>
        </div>

        <div className={styles.conversation}>
          <div className={styles.message}>Scan complete. 3 issues found.</div>
          <div className={styles.message}>Ready to apply fixes.</div>
        </div>

        <div className={styles.inputArea}>
          <TextField
            value={input}
            onChange={setInput}
            placeholder="Ask Klara or start a task…"
            autoComplete="off"
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            connectedRight={
              <Button onClick={handleSubmit}>
                <Icon source={SearchIcon} />
              </Button>
            }
          />
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className={styles.mainPanel}>
        {children || <Outlet />}
      </main>
    </div>
  );
}
