// src/components/BackgroundShell.jsx
import React, { useEffect, useRef, useState } from "react";

const BG_URL = "/assets/images/background.png";

export default function BackgroundShell({ children }) {
  const bgRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  // Detect mobile/desktop (updates on resize/orientation)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => setIsMobile(e.matches);

    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Parallax: subtle on desktop, off on mobile (prevents “warp/stretch” feel)
  useEffect(() => {
    if (isMobile) return;

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const onMove = (clientX, clientY) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (clientX / w) * 2 - 1;
      const ny = (clientY / h) * 2 - 1;
      setParallax({ x: clamp(nx * 6, -6, 6), y: clamp(ny * 4, -4, 4) });
    };

    const onMouseMove = (e) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (!e.touches?.[0]) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!bgRef.current) return;

    // Mobile: no parallax, no zoom (clean + stable)
    if (isMobile) {
      bgRef.current.style.transform = "scale(1) translate3d(0px, 0px, 0)";
      return;
    }

    // Desktop: tiny zoom + subtle parallax
    bgRef.current.style.transform = `scale(1.03) translate3d(${parallax.x}px, ${parallax.y}px, 0)`;
  }, [parallax, isMobile]);

  // SMART sizing rules:
  // - Mobile: cover (fills screen, looks premium)
  // - Desktop: contain (shows full image, avoids heavy crop)
  const backgroundSize = isMobile ? "cover" : "contain";

  // Position rules:
  // - Mobile: top-center (keeps important top artwork visible)
  // - Desktop: center (balanced)
  const backgroundPosition = isMobile ? "center top" : "center center";

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden bg-black">
      {/* Background image */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 will-change-transform transition-transform duration-200"
        style={{
          backgroundImage: `url(${BG_URL})`,
          backgroundRepeat: "no-repeat",
          backgroundSize,
          backgroundPosition,
          backgroundColor: "#000", // important when using 'contain' on desktop (fills bars)
          transformOrigin: isMobile ? "center top" : "center center",
          filter: "brightness(0.42) contrast(1.2) saturate(1.15)",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 bg-black/55" />

      {/* Neon haze */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 25%, rgba(255,0,60,0.18), transparent 60%), radial-gradient(900px 500px at 20% 90%, rgba(255,0,60,0.10), transparent 65%), radial-gradient(900px 500px at 80% 90%, rgba(0,255,210,0.06), transparent 65%)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-25 mix-blend-soft-light"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
        }}
      />

      {/* Foreground content */}
      <div className="relative z-20 min-h-screen bg-transparent">{children}</div>
    </div>
  );
}
