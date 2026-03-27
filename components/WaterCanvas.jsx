import { useEffect, useRef } from 'react';

export default function WaterCanvas() {
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

    // wave layers -- multiple sine waves layered for depth
    const layers = [
      { amplitude: 18, frequency: 0.012, speed: 0.00035, phase: 0,    opacity: 0.18, width: 1.5 },
      { amplitude: 12, frequency: 0.018, speed: 0.00028, phase: 2.1,  opacity: 0.13, width: 1.2 },
      { amplitude: 22, frequency: 0.008, speed: 0.00022, phase: 4.3,  opacity: 0.10, width: 1.8 },
      { amplitude: 9,  frequency: 0.025, speed: 0.00042, phase: 1.5,  opacity: 0.09, width: 1.0 },
      { amplitude: 15, frequency: 0.015, speed: 0.00030, phase: 3.7,  opacity: 0.12, width: 1.3 },
      { amplitude: 25, frequency: 0.006, speed: 0.00018, phase: 0.8,  opacity: 0.07, width: 2.0 },
      { amplitude: 10, frequency: 0.022, speed: 0.00038, phase: 5.1,  opacity: 0.08, width: 1.1 },
    ];

    // shimmer points -- bright specular highlights on wave peaks
    const shimmers = Array.from({ length: 18 }, (_, i) => ({
      xFrac: Math.random(),
      layerIdx: Math.floor(Math.random() * layers.length),
      phaseOffset: Math.random() * Math.PI * 2,
      size: 1.5 + Math.random() * 2.5,
      speed: 0.0008 + Math.random() * 0.0006,
      brightness: 0.5 + Math.random() * 0.5,
    }));

    function getWaveY(layer, x, t) {
      return Math.sin(x * layer.frequency + t * layer.speed + layer.phase) * layer.amplitude;
    }

    function draw(now) {
      const t = now - start;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // draw each wave layer across multiple vertical positions
      const numRows = 9;
      for (let row = 0; row < numRows; row++) {
        const baseY = (h * 0.15) + (h * 0.72 * row / (numRows - 1));

        for (const layer of layers) {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 3) {
            const y = baseY + getWaveY(layer, x, t);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(255,255,255,${layer.opacity * (0.4 + 0.6 * (row / numRows))})`;
          ctx.lineWidth = layer.width;
          ctx.stroke();
        }
      }

      // shimmer highlights on wave peaks
      for (const sh of shimmers) {
        const layer = layers[sh.layerIdx];
        const x = sh.xFrac * w;
        const row = Math.floor(sh.xFrac * numRows);
        const baseY = (h * 0.15) + (h * 0.72 * row / (numRows - 1));
        const y = baseY + getWaveY(layer, x, t);

        // pulse the shimmer
        const pulse = (Math.sin(t * sh.speed + sh.phaseOffset) + 1) / 2;
        const alpha = pulse * sh.brightness * 0.85;
        const size = sh.size * (0.5 + pulse * 0.8);

        const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 6);
        grad.addColorStop(0,   `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.3, `rgba(220,220,255,${alpha * 0.5})`);
        grad.addColorStop(1,   'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.arc(x, y, size * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // sharp bright center dot
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
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
