import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollLockSection — Smooth Native Sticky Scroll Animation Engine
 *
 * - Native CSS sticky positioning (0-glitch, butter-smooth 60fps)
 * - Eliminates overflow:hidden traps and unwanted section snaps
 * - Multi-section support (Hero, How It Works, Pricing/CTA)
 * - 0-Lag direct playerRef updates with lerp momentum
 */
export default function ScrollLockSection({
  children,
  scrollDistance = '250vh',
  totalScrollUnits,
  onProgress,
  playerRef,
  className = '',
  style = {},
  id,
}) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
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

    // Smooth Lerp Physics Loop for 60fps 192-frame updates
    const loop = () => {
      const diff = targetPRef.current - currentPRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentPRef.current += diff * 0.2; // Fast, responsive lerp
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
        setProgress(p);
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

  // Determine sticky height based on scrollDistance or totalScrollUnits
  const computedHeight = style.height || (totalScrollUnits ? `${Math.round(totalScrollUnits / 12)}vh` : scrollDistance);

  return (
    <div
      id={id}
      ref={sectionRef}
      className={`relative ${className}`}
      style={{
        height: computedHeight,
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
        }}
      >
        {typeof children === 'function' ? children(progress) : children}
      </div>
    </div>
  );
}
