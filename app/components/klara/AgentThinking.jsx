import styles from "./AgentThinking.module.css";

export function AgentThinking({ message }) {
  return (
    <div className={styles.thinking}>
      <div className={styles.thinkingBubble}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
      <div className={styles.thinkingText}>{message}</div>
    </div>
  );
}

export default AgentThinking;
