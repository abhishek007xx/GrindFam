import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

/**
 * Ultra HD & High-Performance Frame Sequence Player
 */
const FrameSequencePlayer = forwardRef(function FrameSequencePlayer({
  framesFolder,
  frameCount = 60,
  fps = 30,
  playMode = 'loop',
  holdOnLastFrame = false,
  eager = false,
  fit = 'cover',
  externalProgress,
  className = '',
  style = {},
  scrollContainerRef = null,
  onProgress = null,
}, ref) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(eager);

  const imagesRef = useRef([]);
  const validFrameCountRef = useRef(0);
  const currentFrameRef = useRef(-1);
  const rafIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  // 1. Intersection Observer for lazy preload
  useEffect(() => {
    if (eager) { setIsIntersecting(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsIntersecting(true); observer.disconnect(); } },
      { rootMargin: '400px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [eager]);

  // 2. Preload frames
  useEffect(() => {
    if (!isIntersecting || !framesFolder) return;
    let isCancelled = false;
    let loadedCount = 0;

    const getFrameUrl = (i) => {
      const pad = String(i).padStart(3, '0');
      return `/frames/${framesFolder}/frame_${pad}.webp`;
    };

    const loadImages = async () => {
      const promises = [];
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        promises.push(new Promise((resolve) => {
          img.onload = () => {
            if (!isCancelled) {
              loadedCount++;
              setLoadProgress(Math.round((loadedCount / frameCount) * 100));
            }
            resolve(img);
          };
          img.onerror = () => resolve(null);
        }));
      }
      const results = await Promise.all(promises);
      if (isCancelled) return;
      const valid = results.filter((img) => img && img.naturalWidth > 0);
      if (valid.length > 0) {
        imagesRef.current = valid;
        validFrameCountRef.current = valid.length;
        setIsLoading(false);
      } else {
        console.warn(`[FrameSequencePlayer] No valid images from /frames/${framesFolder}`);
      }
    };

    loadImages();
    return () => { isCancelled = true; };
  }, [isIntersecting, framesFolder, frameCount]);

  // 3. Optimized fast Draw frame
  const drawFrame = (frameIdx) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const images = imagesRef.current;
    if (!canvas || !container || images.length === 0) return;

    const targetIdx = Math.max(0, Math.min(frameIdx, images.length - 1));
    if (currentFrameRef.current === targetIdx && canvas.width > 0) return;
    currentFrameRef.current = targetIdx;

    const img = images[targetIdx];
    if (!img) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false for 2x faster GPU rendering!
    if (!ctx) return;

    // Cap DPR at 1.25 to prevent rendering massive 4.9MP buffers at 60fps
    const dpr = Math.min(1.25, window.devicePixelRatio || 1);
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;

    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Disable smooth filter overhead for instant crisp drawing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    const imgR = img.naturalWidth / img.naturalHeight;
    const conR = width / height;
    let dw, dh, x, y;

    if (fit === 'cover') {
      if (conR > imgR) { dw = width; dh = width / imgR; x = 0; y = (height - dh) / 2; }
      else { dh = height; dw = height * imgR; x = (width - dw) / 2; y = 0; }
    } else {
      if (conR > imgR) { dh = height; dw = height * imgR; x = (width - dw) / 2; y = 0; }
      else { dw = width; dh = width / imgR; x = 0; y = (height - dh) / 2; }
    }

    ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(dw), Math.round(dh));
    ctx.restore();
  };

  // Expose imperative setProgress for 0-lag updates
  useImperativeHandle(ref, () => ({
    setProgress: (p) => {
      if (isLoading || validFrameCountRef.current === 0) return;
      const total = validFrameCountRef.current;
      const frame = Math.min(Math.floor(p * total), total - 1);
      drawFrame(frame);
    },
    drawFrame,
  }));

  // 4. Resize listener
  useEffect(() => {
    const handleResize = () => {
      currentFrameRef.current = -1;
      drawFrame(0);
    };
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', handleResize);
    return () => { ro.disconnect(); window.removeEventListener('resize', handleResize); };
  }, [isLoading, fit]);

  // 5a. External progress prop fallback
  useEffect(() => {
    if (playMode !== 'external' || externalProgress === undefined || isLoading) return;
    const total = validFrameCountRef.current;
    if (total === 0) return;
    const frame = Math.min(Math.floor(externalProgress * total), total - 1);
    drawFrame(frame);
  }, [externalProgress, isLoading, playMode]);

  // 5b. Once / Loop animation
  useEffect(() => {
    if (isLoading || validFrameCountRef.current === 0) return;
    if (playMode !== 'once' && playMode !== 'loop') return;

    const total = validFrameCountRef.current;
    const interval = 1000 / fps;

    const animate = (ts) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = ts;
      const delta = ts - lastFrameTimeRef.current;
      if (delta >= interval) {
        lastFrameTimeRef.current = ts - (delta % interval);
        let next = (currentFrameRef.current < 0 ? 0 : currentFrameRef.current) + 1;
        if (playMode === 'once') {
          if (next >= total) {
            if (holdOnLastFrame) drawFrame(total - 1);
            return;
          }
        } else {
          next = next % total;
        }
        drawFrame(next);
      }
      rafIdRef.current = requestAnimationFrame(animate);
    };

    drawFrame(0);
    rafIdRef.current = requestAnimationFrame(animate);
    return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current); };
  }, [isLoading, playMode, fps, holdOnLastFrame]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={style}
    >
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0A] z-20">
          <div className="w-10 h-10 border-2 border-[#FF6B2C] border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-[11px] text-[#8A8A85] font-mono tracking-widest uppercase">
            LOADING EXPERIENCE&nbsp;({loadProgress}%)
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
});

export default FrameSequencePlayer;
