import { useEffect, useRef } from 'react';

export default function AuroraCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // aurora orbs config
    const orbs = [
      { x: 0.2, y: 0.3, r: 0.55, color: [130, 60, 255], speed: 0.00018, phase: 0 },
      { x: 0.75, y: 0.2, r: 0.45, color: [180, 80, 255], speed: 0.00013, phase: 1.2 },
      { x: 0.5,  y: 0.75, r: 0.5, color: [90, 40, 220],  speed: 0.00021, phase: 2.4 },
      { x: 0.85, y: 0.65, r: 0.4, color: [210, 100, 255], speed: 0.00016, phase: 0.8 },
      { x: 0.1,  y: 0.8,  r: 0.38, color: [100, 50, 200], speed: 0.00019, phase: 3.5 },
    ];

    let start = performance.now();

    function draw(now) {
      const t = now - start;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      for (const orb of orbs) {
        // drift position slowly
        const dx = Math.sin(t * orb.speed * 1.3 + orb.phase) * 0.12;
        const dy = Math.cos(t * orb.speed + orb.phase + 1) * 0.10;
        const cx = (orb.x + dx) * w;
        const cy = (orb.y + dy) * h;
        const radius = orb.r * Math.max(w, h);

        // pulse opacity
        const pulse = 0.13 + Math.sin(t * orb.speed * 4 + orb.phase) * 0.04;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const [r, g, b] = orb.color;
        grad.addColorStop(0,   `rgba(${r},${g},${b},${pulse + 0.08})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${pulse})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
