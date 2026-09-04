import { useEffect, useRef } from "react";

export default function GraphicalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; da: number; color: string }[] = [];
    const COLORS = ["rgba(139,92,246,", "rgba(34,211,238,", "rgba(167,139,250,"];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.5 + 0.1,
        da: (Math.random() - 0.5) * 0.01,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base dark gradient
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, "#08090D");
      bg.addColorStop(0.5, "#0D1017");
      bg.addColorStop(1, "#08090D");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top purple radial glow
      const rg1 = ctx.createRadialGradient(canvas.width * 0.5, 0, 0, canvas.width * 0.5, 0, canvas.width * 0.7);
      rg1.addColorStop(0, "rgba(139,92,246,0.07)");
      rg1.addColorStop(1, "transparent");
      ctx.fillStyle = rg1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyan accent glow (subtle)
      const rg2 = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.3, 0, canvas.width * 0.8, canvas.height * 0.3, 400);
      rg2.addColorStop(0, "rgba(34,211,238,0.04)");
      rg2.addColorStop(1, "transparent");
      ctx.fillStyle = rg2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid
      ctx.save();
      ctx.strokeStyle = "rgba(37,43,56,0.4)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      ctx.restore();

      // Floating particles
      tick += 0.5;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.da;
        if (p.a < 0.05 || p.a > 0.6) p.da *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y + Math.sin(tick * 0.01 + p.x) * 3, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.a + ")";
        ctx.fill();
      });

      // Subtle vignette
      const vg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.9
      );
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(8,9,13,0.6)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}