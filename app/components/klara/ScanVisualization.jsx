import { useEffect, useRef } from "react";
import styles from "./ScanVisualization.module.css";

export default function ScanVisualization({ progress, isScanning }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 60;

    let animationId;
    let rotation = 0;

    const drawSphere = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(15, 20, 25, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.5);
      gradient.addColorStop(0, "rgba(34, 211, 238, 0.3)");
      gradient.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw main sphere
      const sphereGradient = ctx.createRadialGradient(centerX - 15, centerY - 15, 0, centerX, centerY, baseRadius);
      sphereGradient.addColorStop(0, "#22d3ee");
      sphereGradient.addColorStop(0.5, "#06b6d4");
      sphereGradient.addColorStop(1, "#0891b2");
      ctx.fillStyle = sphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw rotating rings
      ctx.strokeStyle = "rgba(34, 211, 238, 0.6)";
      ctx.lineWidth = 2;

      // Ring 1
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ring 2
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotation * 0.7);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw orbiting particles
      const particleCount = isScanning ? 12 : 6;
      for (let i = 0; i < particleCount; i++) {
        const angle = (rotation + (i / particleCount) * Math.PI * 2) * (isScanning ? 2 : 1);
        const distance = baseRadius * 1.4;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        ctx.fillStyle = `rgba(34, 211, 238, ${0.6 + Math.sin(rotation + i) * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw fairy dust particles
      if (isScanning) {
        ctx.fillStyle = "rgba(34, 211, 238, 0.8)";
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = baseRadius + Math.random() * 40;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          const size = Math.random() * 2 + 1;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update rotation
      rotation += isScanning ? 0.05 : 0.01;

      animationId = requestAnimationFrame(drawSphere);
    };

    drawSphere();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isScanning]);

  return (
    <div className={styles.visualization}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className={styles.canvas}
      />
      <div className={styles.label}>
        {isScanning ? "Scanning..." : "Ready to Scan"}
      </div>
      <div className={styles.progress}>{Math.round(progress)}%</div>
    </div>
  );
}


