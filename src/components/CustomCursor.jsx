import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function animate() {
      // Dot snaps instantly
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

      // Ring lags behind with lerp
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;

      rafId = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(animate);

    // Hide default cursor on desktop
    document.documentElement.style.cursor = 'none';

    // Show ring/dot on interactive elements
    function onMouseOver(e) {
      const el = e.target;
      const isInteractive = el.closest('a, button, [role="button"], input, textarea, select, label');
      if (isInteractive) {
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.marginLeft = '-2px';
        ring.style.marginTop = '-2px';
        ring.style.borderColor = 'rgba(0, 240, 255, 0.8)';
      } else {
        ring.style.width = '32px';
        ring.style.height = '32px';
        ring.style.marginLeft = '0';
        ring.style.marginTop = '0';
        ring.style.borderColor = 'rgba(0, 240, 255, 0.5)';
      }
    }

    document.addEventListener('mouseover', onMouseOver);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = '';
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Small filled dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#00F0FF',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
      {/* Larger lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(0, 240, 255, 0.5)',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
          transition: 'width 0.15s, height 0.15s, border-color 0.15s',
        }}
      />
    </>
  );
}
