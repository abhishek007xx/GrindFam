import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollLockSection — Apple-Style CSS Sticky Scroll Pinning Engine
 *
 * - Pins container to viewport (position: sticky; top: 0) while user scrolls
 * - Frame sequence scrubs 0% -> 100% as user scrolls through outer container height
 * - Unpins naturally when animation completes, smoothly revealing next section
 * - 0-glitch, 60fps performance with smooth lerp physics
 */
export default function ScrollLockSection({
  children,
  totalScrollUnits = 2800,
  scrollDistance,
  onProgress,
  playerRef,
  className = '',
  style = {},
  id,
}) {
  const sectionRef = useRef(null);
  const [progressState, setProgressState] = useState(0);
  const targetPRef = useRef(0);
  const currentPRef = useRef(0);
  const lastEmittedPRef = useRef(-1);
  const rafIdRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const updateTarget = () => {
      const rect = section.getBoundingClientRect();
      const totalDist = rect.height - window.innerHeight;
      if (totalDist <= 0) return;

      const scrolled = -rect.top;
      const rawP = scrolled / totalDist;
      targetPRef.current = Math.max(0, Math.min(1, rawP));
    };

    const loop = () => {
      const diff = targetPRef.current - currentPRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentPRef.current += diff * 0.25; // Smooth 60fps lerp
      } else {
        currentPRef.current = targetPRef.current;
      }

      const p = Math.max(0, Math.min(1, currentPRef.current));

      if (Math.abs(p - lastEmittedPRef.current) > 0.0005) {
        lastEmittedPRef.current = p;
        if (playerRef?.current?.setProgress) {
          playerRef.current.setProgress(p);
        }
        onProgress?.(p);
        setProgressState(p);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget, { passive: true });
    updateTarget();
    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [playerRef, onProgress]);

  // Calculate sticky track height (e.g. 280vh for 2800 units)
  const trackHeight = style.height || scrollDistance || `${Math.max(200, Math.round(totalScrollUnits / 10))}vh`;

  return (
    <div
      id={id}
      ref={sectionRef}
      className={`relative ${className}`}
      style={{
        height: trackHeight,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {typeof children === 'function' ? children(progressState) : children}
      </div>
    </div>
  );
}
