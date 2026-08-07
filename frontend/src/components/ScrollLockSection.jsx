import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollLockSection — True Screen Locking Engine with Zero Snap-Back
 *
 * - Locks document viewport 100% while scrubbing 192 frames
 * - Safety guard (canExitBackRef) prevents trailing trackpad momentum from snapping back to Section 1
 * - Smooth lerp physics for ultra-fluid 60fps frame updates
 * - Multi-section support (Hero, How It Works, Pricing/CTA)
 */
export default function ScrollLockSection({
  children,
  totalScrollUnits = 2800,
  onProgress,
  playerRef,
  className = '',
  style = {},
  id,
}) {
  const sectionRef = useRef(null);
  const isActiveRef = useRef(false);
  const isDoneRef = useRef(false);
  const canExitBackRef = useRef(false);
  const lockTimeRef = useRef(0);

  const targetAccRef = useRef(0);
  const currentAccRef = useRef(0);
  const rafIdRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const [progressState, setProgressState] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // -- Lock Page --
    const lock = (fromBelow = false) => {
      if (isActiveRef.current) return;

      lockTimeRef.current = Date.now();
      isActiveRef.current = true;

      if (fromBelow) {
        isDoneRef.current = false;
        canExitBackRef.current = true;
        targetAccRef.current = totalScrollUnits;
        currentAccRef.current = totalScrollUnits;
      } else {
        targetAccRef.current = 0;
        currentAccRef.current = 0;
        canExitBackRef.current = false; // Prevent immediate reverse snap on entry
      }

      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.round(top), behavior: 'instant' });
      document.documentElement.style.overflow = 'hidden';

      startPhysicsLoop();
    };

    // -- Unlock Page --
    const unlock = (autoAdvance = false) => {
      if (!isActiveRef.current) return;
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
    let lastDirection = 1;
    const trackScroll = () => {
      if (window.scrollY !== prevScrollY) {
        lastDirection = window.scrollY > prevScrollY ? 1 : -1;
        prevScrollY = window.scrollY;
      }
    };
    window.addEventListener('scroll', trackScroll, { passive: true });

    // IntersectionObserver to trigger lock when section enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Cooldown check (don't lock if unlocked less than 400ms ago)
        if (Date.now() - lockTimeRef.current < 400) return;

        if (entry.isIntersecting && entry.intersectionRatio > 0.85) {
          const fromBelow = lastDirection === -1;
          lock(fromBelow);
        }
      },
      { threshold: [0, 0.5, 0.85, 1.0] }
    );
    observer.observe(section);

    // Physics Loop
    const stepPhysics = () => {
      if (!isActiveRef.current) return;

      const diff = targetAccRef.current - currentAccRef.current;

      if (Math.abs(diff) > 0.05) {
        currentAccRef.current += diff * 0.18;
      } else {
        currentAccRef.current = targetAccRef.current;
      }

      // Enable exit-back after user has scrolled forward past 150 units
      if (currentAccRef.current > 150) {
        canExitBackRef.current = true;
      }

      // Check if user scrolled back past start (acc < -60) AND exit is allowed
      if (currentAccRef.current < -60 && targetAccRef.current < -60 && canExitBackRef.current) {
        targetAccRef.current = 0;
        currentAccRef.current = 0;
        if (playerRef?.current?.setProgress) playerRef.current.setProgress(0);
        onProgress?.(0);
        setProgressState(0);
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
        setProgressState(p);
      }

      // Reached 100% completion going forward
      if (targetAccRef.current >= totalScrollUnits + 120 && !isDoneRef.current) {
        isDoneRef.current = true;
        unlock(true);
        return;
      }

      if (Math.abs(diff) > 0.05 || isActiveRef.current) {
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

      const clampedDelta = Math.max(-80, Math.min(80, delta));
      targetAccRef.current += clampedDelta;

      const minAcc = canExitBackRef.current ? -100 : 0;
      targetAccRef.current = Math.max(minAcc, Math.min(totalScrollUnits + 180, targetAccRef.current));

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

      const clampedDelta = Math.max(-50, Math.min(50, dy * 1.8));
      targetAccRef.current += clampedDelta;

      const minAcc = canExitBackRef.current ? -100 : 0;
      targetAccRef.current = Math.max(minAcc, Math.min(totalScrollUnits + 180, targetAccRef.current));

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
      id={id}
      ref={sectionRef}
      className={`relative ${className}`}
      style={{ height: '100vh', overflow: 'hidden', ...style }}
    >
      {typeof children === 'function' ? children(progressState) : children}
    </div>
  );
}

