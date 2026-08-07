import React, { useEffect, useRef } from 'react';

/**
 * ScrollLockSection — Ultra Smooth Inertia Physics & Seamless Back-Scroll
 *
 * - Full 192-frame support
 * - Smooth Ease-Out Momentum (coasts to a gentle stop when scroll ends)
 * - Glitch-Free Reverse Scrolling & Re-entry
 * - 0-Lag direct playerRef updates
 */
export default function ScrollLockSection({
  children,
  totalScrollUnits = 3800,
  onProgress,
  playerRef,
  className = '',
  style = {},
}) {
  const sectionRef = useRef(null);
  const isActiveRef = useRef(false);
  const isDoneRef = useRef(false);
  
  const targetAccRef = useRef(0);
  const currentAccRef = useRef(0);
  const rafIdRef = useRef(null);
  const lastDirectionRef = useRef(0);
  const lastProgressRef = useRef(-1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // -- Lock Page --
    const lock = (fromBelow = false) => {
      if (isActiveRef.current) return;
      
      if (fromBelow) {
        isDoneRef.current = false;
        targetAccRef.current = totalScrollUnits;
        currentAccRef.current = totalScrollUnits;
      } else if (isDoneRef.current) {
        return;
      }
      
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.round(top), behavior: 'instant' });
      document.documentElement.style.overflow = 'hidden';
      isActiveRef.current = true;
      startPhysicsLoop();
    };

    // -- Unlock Page --
    const unlock = (autoAdvance = false) => {
      if (!isActiveRef.current && !autoAdvance) return;
      isActiveRef.current = false;
      document.documentElement.style.overflow = '';
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      if (autoAdvance) {
        requestAnimationFrame(() => {
          const next = section.nextElementSibling;
          if (next) {
            next.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
          }
        });
      }
    };

    // Track scroll direction for entry detection
    let prevScrollY = window.scrollY;
    const trackScroll = () => {
      lastDirectionRef.current = window.scrollY > prevScrollY ? 1 : -1;
      prevScrollY = window.scrollY;
    };
    window.addEventListener('scroll', trackScroll, { passive: true });

    // IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.92) {
          const fromBelow = lastDirectionRef.current === -1;
          lock(fromBelow);
        } else if (!entry.isIntersecting && isActiveRef.current) {
          unlock(false);
        }
      },
      { threshold: [0, 0.5, 0.92, 1.0] }
    );
    observer.observe(section);

    // Physics Loop with Ease-Out Momentum (coasts smoothly for 192 frames)
    const stepPhysics = () => {
      if (!isActiveRef.current) return;

      const diff = targetAccRef.current - currentAccRef.current;
      
      // Smooth 0.14 lerp factor for rich, responsive 192-frame motion
      if (Math.abs(diff) > 0.05) {
        currentAccRef.current += diff * 0.14;
      } else {
        currentAccRef.current = targetAccRef.current;
      }

      // Check if user scrolled back past start (acc < -40)
      if (currentAccRef.current < -40 && targetAccRef.current < -40) {
        targetAccRef.current = 0;
        currentAccRef.current = 0;
        if (playerRef?.current?.setProgress) playerRef.current.setProgress(0);
        onProgress?.(0);
        unlock(false);
        
        requestAnimationFrame(() => {
          const prev = section.previousElementSibling;
          if (prev) prev.scrollIntoView({ behavior: 'smooth' });
          else window.scrollBy({ top: -150, behavior: 'smooth' });
        });
        return;
      }

      const clampedAcc = Math.max(0, Math.min(totalScrollUnits, currentAccRef.current));
      const p = clampedAcc / totalScrollUnits;

      if (Math.abs(p - lastProgressRef.current) > 0.001) {
        lastProgressRef.current = p;
        if (playerRef?.current?.setProgress) {
          playerRef.current.setProgress(p);
        }
        onProgress?.(p);
      }

      // Reached 100% completion going forward
      if (targetAccRef.current >= totalScrollUnits + 150 && !isDoneRef.current) {
        isDoneRef.current = true;
        unlock(true);
        return;
      }

      if (Math.abs(diff) > 0.05) {
        rafIdRef.current = requestAnimationFrame(stepPhysics);
      } else {
        rafIdRef.current = null;
      }
    };

    const startPhysicsLoop = () => {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(stepPhysics);
      }
    };

    // Wheel Handler
    const handleWheel = (e) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      if (e.deltaMode === 2) delta *= 300;

      const clampedDelta = Math.max(-90, Math.min(90, delta));
      targetAccRef.current += clampedDelta;
      targetAccRef.current = Math.max(-100, Math.min(totalScrollUnits + 200, targetAccRef.current));

      startPhysicsLoop();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    // Touch Support
    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;

      const clampedDelta = Math.max(-60, Math.min(60, dy * 2.0));
      targetAccRef.current += clampedDelta;
      targetAccRef.current = Math.max(-100, Math.min(totalScrollUnits + 200, targetAccRef.current));

      startPhysicsLoop();
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', trackScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      observer.disconnect();
      document.documentElement.style.overflow = '';
    };
  }, [totalScrollUnits, playerRef, onProgress]);

  return (
    <div
      ref={sectionRef}
      className={`relative ${className}`}
      style={{ height: '100vh', overflow: 'hidden', ...style }}
    >
      {typeof children === 'function' ? children(Math.max(0, Math.min(1, currentAccRef.current / totalScrollUnits))) : children}
    </div>
  );
}
