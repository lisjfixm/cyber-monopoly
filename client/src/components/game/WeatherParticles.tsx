import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { WeatherType } from '@shared/api.interface';

interface WeatherParticlesProps {
  weather: WeatherType;
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  opacity: number;
}

const WeatherParticles: FC<WeatherParticlesProps> = ({ weather, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const weatherRef = useRef<WeatherType>(weather);
  const flashRef = useRef<{ active: boolean; time: number; next: number }>({
    active: false,
    time: 0,
    next: 3000,
  });

  useEffect(() => {
    weatherRef.current = weather;
    particlesRef.current = [];
  }, [weather]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = (): void => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const createRainParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0.8,
      vy: 3 + Math.random() * 3,
      size: 2 + Math.random() * 1.5,
      life: 1,
      maxLife: 1,
      opacity: 0.4 + Math.random() * 0.3,
    });

    const createSunParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0.2 + Math.random() * 0.3,
      vy: -(0.1 + Math.random() * 0.2),
      size: 1 + Math.random() * 2,
      life: 1,
      maxLife: 1,
      opacity: 0.2 + Math.random() * 0.3,
    });

    const createStormParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 4,
      size: 1.5 + Math.random() * 2,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1,
      opacity: 0.6 + Math.random() * 0.4,
    });

    const createFogParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.8 + h * 0.1,
      vx: 0.15 + Math.random() * 0.2,
      vy: 0,
      size: 40 + Math.random() * 60,
      life: 1,
      maxLife: 1,
      opacity: 0.04 + Math.random() * 0.06,
    });

    const createNeonParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 1.5 + Math.random() * 2,
      life: 1,
      maxLife: 1,
      opacity: 0.5 + Math.random() * 0.5,
    });

    const createSpaceParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0,
      vy: 0,
      size: 0.8 + Math.random() * 1.5,
      life: Math.random(),
      maxLife: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
    });

    const initParticles = (w: number, h: number, type: WeatherType): void => {
      const arr: Particle[] = [];
      let count = 0;
      switch (type) {
        case 'rain':
          count = 60;
          for (let i = 0; i < count; i += 1) arr.push(createRainParticle(w, h));
          break;
        case 'sunny':
          count = 25;
          for (let i = 0; i < count; i += 1) arr.push(createSunParticle(w, h));
          break;
        case 'em_storm':
          count = 40;
          for (let i = 0; i < count; i += 1) arr.push(createStormParticle(w, h));
          flashRef.current.next = 2000 + Math.random() * 2000;
          break;
        case 'fog':
          count = 12;
          for (let i = 0; i < count; i += 1) arr.push(createFogParticle(w, h));
          break;
        case 'neon_night':
          count = 50;
          for (let i = 0; i < count; i += 1) arr.push(createNeonParticle(w, h));
          break;
        case 'space_calm':
          count = 70;
          for (let i = 0; i < count; i += 1) arr.push(createSpaceParticle(w, h));
          break;
        default:
          break;
      }
      particlesRef.current = arr;
    };

    let lastTime = performance.now();

    const render = (now: number): void => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const currentWeather = weatherRef.current;

      if (particlesRef.current.length === 0 && w > 0 && h > 0) {
        initParticles(w, h, currentWeather);
      }

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      switch (currentWeather) {
        case 'rain': {
          ctx.strokeStyle = 'rgba(100, 180, 255, 0.6)';
          ctx.lineWidth = 1;
          for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.y > h) {
              p.y = -5;
              p.x = Math.random() * w;
            }
            if (p.x > w) p.x = 0;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 2, p.y + p.size);
            ctx.stroke();
          }
          break;
        }
        case 'sunny': {
          // 陽光光束
          const grad = ctx.createLinearGradient(0, 0, w * 0.8, h);
          grad.addColorStop(0, 'rgba(255, 220, 100, 0.06)');
          grad.addColorStop(0.5, 'rgba(255, 220, 100, 0.03)');
          grad.addColorStop(1, 'rgba(255, 220, 100, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(w * 0.1, 0);
          ctx.lineTo(w * 0.4, 0);
          ctx.lineTo(w, h);
          ctx.lineTo(w * 0.6, h);
          ctx.closePath();
          ctx.fill();
          // 漂浮塵埃
          ctx.fillStyle = 'rgba(255, 220, 100, 0.5)';
          for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.y < -5) {
              p.y = h + 5;
              p.x = Math.random() * w;
            }
            if (p.x > w) p.x = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'em_storm': {
          // 閃電
          flashRef.current.time += (now - (lastTime - dt * 16.67));
          if (flashRef.current.time > flashRef.current.next) {
            flashRef.current.active = true;
            flashRef.current.time = 0;
            flashRef.current.next = 2000 + Math.random() * 2000;
            setTimeout(() => {
              flashRef.current.active = false;
            }, 100);
          }
          if (flashRef.current.active) {
            ctx.fillStyle = 'rgba(180, 100, 255, 0.15)';
            ctx.fillRect(0, 0, w, h);
          }
          // 紫色粒子
          for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.fillStyle = `rgba(200, 100, 255, ${p.opacity})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(200, 100, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          break;
        }
        case 'fog': {
          for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.x += p.vx * dt;
            if (p.x - p.size > w) {
              p.x = -p.size;
              p.y = Math.random() * h * 0.8 + h * 0.1;
            }
            const fogGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            fogGrad.addColorStop(0, `rgba(220, 220, 230, ${p.opacity})`);
            fogGrad.addColorStop(1, 'rgba(220, 220, 230, 0)');
            ctx.fillStyle = fogGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'neon_night': {
          for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            ctx.fillStyle = `rgba(255, 107, 157, ${p.opacity})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(255, 107, 157, 0.9)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          break;
        }
        case 'space_calm': {
          for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            p.life += 0.01 * dt;
            if (p.life > p.maxLife) {
              p.life = 0;
              p.x = Math.random() * w;
              p.y = Math.random() * h;
            }
            const twinkle = 0.3 + 0.7 * Math.abs(Math.sin((p.life / p.maxLife) * Math.PI));
            ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity * twinkle})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          break;
        }
        default:
          break;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
      ro.disconnect();
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default WeatherParticles;
