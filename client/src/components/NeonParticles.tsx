import React, { useEffect, useRef } from 'react';

interface NeonParticlesProps {
  count?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
}

/**
 * 輕量霓虹粒子背景
 * - 純 Canvas 2D + requestAnimationFrame 驅動
 * - 移動端自動減少粒子數，保證 60fps
 * - 粒子緩慢漂浮 + 透明度呼吸閃爍
 * - 鄰近粒子之間繪製微弱發光連線
 * - 讀取 data-animation="off" 時靜止（只畫一幀）
 * - 頁面隱藏時暫停動畫
 */
const NeonParticles: React.FC<NeonParticlesProps> = ({
  count = 30,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /** 判斷是否為移動端 */
    const isMobile = (): boolean =>
      typeof window !== 'undefined' && window.innerWidth < 768;

    /** 取得粒子顏色池（賽博朋克三色） */
    const getColors = (): string[] => {
      const styles = getComputedStyle(document.documentElement);
      const cyan = styles.getPropertyValue('--cyan').trim() || 'hsl(180, 100%, 55%)';
      const pink = styles.getPropertyValue('--pink').trim() || 'hsl(320, 100%, 60%)';
      const purple = styles.getPropertyValue('--purple').trim() || 'hsl(270, 80%, 65%)';
      return [cyan, pink, purple];
    };

    /** 調整畫布尺寸 */
    const resize = (): void => {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** 建立粒子陣列 */
    const createParticles = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const colors = getColors();
      const particleCount = isMobile() ? Math.min(count, 15) : count;
      const particles: Particle[] = [];

      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 1 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          baseAlpha: 0.4 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.008 + Math.random() * 0.012,
        });
      }

      particlesRef.current = particles;
    };

    /** 更新粒子位置與相位 */
    const updateParticles = (dt: number): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        p.phase += p.phaseSpeed * dt * 0.06;

        // 邊界反彈
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // 確保在範圍內
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }
    };

    /** 繪製粒子與連線 */
    const draw = (): void => {
      if (!ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, w, h);

      // 連線（cyan 色、極低透明度）
      const lineDistance = 120;
      const styles = getComputedStyle(document.documentElement);
      const cyan = styles.getPropertyValue('--cyan').trim() || 'hsl(180, 100%, 55%)';

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < lineDistance) {
            const alpha = (1 - dist / lineDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = cyan;
            ctx.globalAlpha = alpha;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // 粒子本體（帶發光）
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase));

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    /** 檢查動畫是否開啟 */
    const isAnimationEnabled = (): boolean =>
      document.documentElement.getAttribute('data-animation') !== 'off';

    /** 動畫主迴圈 */
    const animate = (time: number): void => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min(time - lastTimeRef.current, 50); // 限制最大步長
      lastTimeRef.current = time;

      if (!pausedRef.current) {
        updateParticles(dt);
      }
      draw();

      if (isAnimationEnabled() && !pausedRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };

    /** 啟動或停止動畫 */
    const startAnimation = (): void => {
      if (rafRef.current !== null) return;
      lastTimeRef.current = 0;
      if (isAnimationEnabled()) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // 靜止模式：只畫一幀
        draw();
      }
    };

    const stopAnimation = (): void => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    /** 可見性變化處理 */
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        pausedRef.current = true;
        stopAnimation();
      } else {
        pausedRef.current = false;
        startAnimation();
      }
    };

    /** 視窗大小變化處理 */
    const handleResize = (): void => {
      resize();
      createParticles();
      if (!isAnimationEnabled()) draw();
    };

    // 初始化
    resize();
    createParticles();
    startAnimation();

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAnimation();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default NeonParticles;
