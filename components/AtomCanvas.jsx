import { useEffect, useRef } from 'react';

export default function AtomCanvas() {
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

    // multiple atom systems scattered across the canvas
    const systems = [
      { x: 0.25, y: 0.35, scale: 1.1, tilt: 0.3 },
      { x: 0.72, y: 0.22, scale: 0.7, tilt: 1.1 },
      { x: 0.55, y: 0.72, scale: 0.85, tilt: 0.7 },
      { x: 0.85, y: 0.6,  scale: 0.55, tilt: 1.8 },
      { x: 0.1,  y: 0.75, scale: 0.6,  tilt: 2.2 },
    ];

    // each system has 3 orbital rings with electrons
    function buildSystem(sys) {
      const orbits = [];
      const numOrbits = 3;
      for (let i = 0; i < numOrbits; i++) {
        const angle = (Math.PI / numOrbits) * i;
        orbits.push({
          tiltX: Math.sin(angle + sys.tilt) * 0.6,
          tiltY: Math.cos(angle + sys.tilt) * 0.6,
          radius: (80 + i * 30) * sys.scale,
          speed: (0.0006 + i * 0.0002) * (i % 2 === 0 ? 1 : -1),
          phase: (Math.PI * 2 / numOrbits) * i,
          // trail history
          trail: [],
          trailMax: 38,
        });
      }
      return orbits;
    }

    const allSystems = systems.map(sys => ({
      ...sys,
      orbits: buildSystem(sys)
    }));

    const start = performance.now();

    function draw(now) {
      const t = now - start;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      for (const sys of allSystems) {
        const cx = sys.x * w;
        const cy = sys.y * h;
        const baseR = 90 * sys.scale;

        // nucleus glow
        const nucGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.22);
        nucGrad.addColorStop(0,   'rgba(200,150,255,0.55)');
        nucGrad.addColorStop(0.5, 'rgba(150,80,255,0.18)');
        nucGrad.addColorStop(1,   'rgba(100,40,220,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = nucGrad;
        ctx.fill();

        // nucleus dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5 * sys.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220,180,255,0.9)';
        ctx.fill();

        for (const orb of sys.orbits) {
          const angle = t * orb.speed + orb.phase;

          // compute 3d-ish ellipse position
          const ex = Math.cos(angle) * orb.radius;
          const ey = Math.sin(angle) * orb.radius * (0.35 + Math.abs(orb.tiltX) * 0.3);

          // rotate by tilt
          const rx = ex * Math.cos(orb.tiltY) - ey * Math.sin(orb.tiltX);
          const ry = ex * Math.sin(orb.tiltY) + ey * Math.cos(orb.tiltX);

          const px = cx + rx;
          const py = cy + ry;

          // push to trail
          orb.trail.push({ x: px, y: py });
          if (orb.trail.length > orb.trailMax) orb.trail.shift();

          // draw orbital path (faint ellipse)
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(orb.tiltY);
          ctx.scale(1, 0.35 + Math.abs(orb.tiltX) * 0.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, orb.radius, orb.radius, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(160,100,255,0.07)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // draw fading trail
          for (let j = 1; j < orb.trail.length; j++) {
            const alpha = (j / orb.trail.length) * 0.7;
            const width = (j / orb.trail.length) * 2.5 * sys.scale;
            ctx.beginPath();
            ctx.moveTo(orb.trail[j - 1].x, orb.trail[j - 1].y);
            ctx.lineTo(orb.trail[j].x, orb.trail[j].y);
            ctx.strokeStyle = `rgba(180,100,255,${alpha})`;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.stroke();
          }

          // electron glow
          const eGrad = ctx.createRadialGradient(px, py, 0, px, py, 9 * sys.scale);
          eGrad.addColorStop(0,   'rgba(220,170,255,0.95)');
          eGrad.addColorStop(0.4, 'rgba(170,80,255,0.5)');
          eGrad.addColorStop(1,   'rgba(120,40,220,0)');
          ctx.beginPath();
          ctx.arc(px, py, 9 * sys.scale, 0, Math.PI * 2);
          ctx.fillStyle = eGrad;
          ctx.fill();

          // electron core dot
          ctx.beginPath();
          ctx.arc(px, py, 2.5 * sys.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(240,210,255,1)';
          ctx.fill();
        }
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
