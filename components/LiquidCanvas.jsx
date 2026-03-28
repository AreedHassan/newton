import { useEffect, useRef } from 'react';

export default function LiquidCanvas() {
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

    const start = performance.now();

    const NUM_POINTS = 8;
    const points = Array.from({ length: NUM_POINTS }, (_, i) => ({
      xFrac: i / (NUM_POINTS - 1),
      speed:  0.00055 + Math.random() * 0.00040,
      amplitude: 0.04 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      speed2: 0.00035 + Math.random() * 0.00025,
    }));

    function getSurfaceY(t, w, h) {
      const baseY = h * 0.55;
      return points.map(p => {
        const dy =
          Math.sin(t * p.speed + p.phase) * p.amplitude * h +
          Math.sin(t * p.speed2 + p.phase2) * p.amplitude * 0.5 * h;
        return { x: p.xFrac * w, y: baseY + dy };
      });
    }

    function getYAtX(pts, x, h) {
      for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i].x) {
          const t = (x - pts[i - 1].x) / (pts[i].x - pts[i - 1].x);
          return pts[i - 1].y + t * (pts[i].y - pts[i - 1].y);
        }
      }
      return h * 0.55;
    }

    function draw(now) {
      const t = now - start;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const pts = getSurfaceY(t, w, h);

      // liquid fill
      const fillGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
      fillGrad.addColorStop(0,    'rgba(18,18,18,0.0)');
      fillGrad.addColorStop(0.08, 'rgba(22,22,22,0.88)');
      fillGrad.addColorStop(0.3,  'rgba(15,15,15,0.97)');
      fillGrad.addColorStop(1,    'rgba(8,8,8,1)');

      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // sharp silver edge -- main shine
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // outer glow on edge
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
      }
      ctx.strokeStyle = 'rgba(220,220,255,0.15)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // soft inner glow just below edge
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y + 3);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y + 3, cpx, curr.y + 3, curr.x, curr.y + 3);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 5;
      ctx.stroke();

      // travelling silver shimmer spots along the edge
      const shimmerCount = 4;
      for (let s = 0; s < shimmerCount; s++) {
        const shimmerPhase = (t * 0.00055 + s * (1 / shimmerCount) * Math.PI * 2) % (Math.PI * 2);
        const shimmerX = ((Math.sin(shimmerPhase) + 1) / 2) * w;
        const shimmerY = getYAtX(pts, shimmerX, h);
        const pulse = (Math.sin(shimmerPhase * 2) + 1) / 2;
        const alpha = 0.3 + pulse * 0.55;
        const radius = 18 + pulse * 22;

        const sGrad = ctx.createRadialGradient(shimmerX, shimmerY, 0, shimmerX, shimmerY, radius);
        sGrad.addColorStop(0,   `rgba(255,255,255,${alpha})`);
        sGrad.addColorStop(0.4, `rgba(220,220,255,${alpha * 0.4})`);
        sGrad.addColorStop(1,   'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = sGrad;
        ctx.fill();
      }

      // reflective light patches on liquid body
      const reflections = [
        { xFrac: 0.15, brightness: 0.06 },
        { xFrac: 0.55, brightness: 0.04 },
        { xFrac: 0.82, brightness: 0.07 },
      ];

      for (const ref of reflections) {
        const cx = ref.xFrac * w;
        const surfY = getYAtX(pts, cx, h);
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.00065 + ref.xFrac * 5);
        const rw = 0.2 * w;
        const rh = h * 0.22;

        const rGrad = ctx.createRadialGradient(cx, surfY + rh * 0.3, 0, cx, surfY + rh * 0.3, rw);
        rGrad.addColorStop(0,   `rgba(255,255,255,${ref.brightness * pulse})`);
        rGrad.addColorStop(0.5, `rgba(200,200,200,${ref.brightness * pulse * 0.3})`);
        rGrad.addColorStop(1,   'rgba(255,255,255,0)');

        ctx.save();
        ctx.scale(1, rh / rw);
        ctx.beginPath();
        ctx.arc(cx, (surfY + rh * 0.3) * (rw / rh), rw, 0, Math.PI * 2);
        ctx.fillStyle = rGrad;
        ctx.fill();
        ctx.restore();
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
