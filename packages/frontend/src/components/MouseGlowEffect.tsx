// components/MouseGlowEffect.tsx
import { useEffect, useRef } from 'preact/hooks';

export default function MouseGlowEffect() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX + 'px';
        glowRef.current.style.top = e.clientY + 'px';
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed w-96 h-96 pointer-events-none z-0 transition-all duration-200"
      style={{
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
        transform: 'translate(-50%, -50%)',
      }}
      aria-hidden="true"
    />
  );
}
