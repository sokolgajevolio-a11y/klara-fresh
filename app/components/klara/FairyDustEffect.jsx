import { useEffect, useRef } from "react";
import styles from "./FairyDustEffect.module.css";

export default function FairyDustEffect({ active }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = styles.particle;

      const size = Math.random() * 4 + 2;
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5;
      const left = Math.random() * 100;
      const top = Math.random() * 100;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.top = `${top}%`;
      particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
      particle.style.opacity = Math.random() * 0.6 + 0.4;

      container.appendChild(particle);
    }

    return () => {
      container.innerHTML = "";
    };
  }, [active]);

  if (!active) return null;

  return <div ref={containerRef} className={styles.fairyDustEffect} />;
}


