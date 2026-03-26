import { useEffect, useRef } from 'react';

export default function TrainCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const trains = [];

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnTrain() {
      const y = Math.random() * canvas.height;
      const speed = 280 + Math.random() * 200;
      const goingRight = Math.random() > 0.5;
      trains.push({
        x: goingRight ? -60 : canvas.width + 60,
        y,
        speed: goingRight ? speed : -speed,
        trail: [],
        length: 60 + Math.random() * 40,
        opacity: 0.7 + Math.random() * 0.3
      });
    }

    for (let i = 0; i < 4; i++) {
      setTimeout(spawnTrain, i * 1200);
    }

    const spawnInterval = setInterval(() => {
      if (trains.length < 6) spawnTrain();
    }, 1400);

    let last = performance.now();
    function draw(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = trains.length - 1; i >= 0; i--) {
        const t = trains[i];
        t.x += t.speed * dt;
        t.trail.unshift({ x: t.x, y: t.y });
        if (t.trail.length > 40) t.trail.pop();

        for (let j = 0; j < t.trail.length - 1; j++) {
          const alpha = (1 - j / t.trail.length) * t.opacity * 0.8;
          const width = (1 - j / t.trail.length) * 2.5;
          ctx.beginPath();
          ctx.moveTo(t.trail[j].x, t.trail[j].y);
          ctx.lineTo(t.trail[j + 1].x, t.trail[j + 1].y);
          ctx.strokeStyle = `rgba(80,160,255,${alpha})`;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 10);
        grad.addColorStop(0, `rgba(140,200,255,${t.opacity})`);
        grad.addColorStop(0.4, `rgba(60,140,255,${t.opacity * 0.6})`);
        grad.addColorStop(1, 'rgba(0,80,255,0)');
        ctx.beginPath();
        ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        if ((t.speed > 0 && t.x > canvas.width + 80) || (t.speed < 0 && t.x < -80)) {
          trains.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(spawnInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="trains-canvas"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
