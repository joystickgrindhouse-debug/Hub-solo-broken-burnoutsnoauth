import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const bgRef = useRef(null);

  // ✅ Your real deployed URLs
  const SOLO_URL = "https://riv-solo.vercel.app/";
  const BURNOUTS_URL = "https://burnouts.vercel.app/";

  // If Live isn't deployed yet, keep it internal + show Coming Soon badge
  const LIVE_COMING_SOON = true;

  const gameModes = useMemo(
    () => [
      {
        id: "solo",
        name: "Solo",
        image: "/assets/images/solo.png",
        link: SOLO_URL,
        external: true,
        desc: "AI rep detection. Solo grind mode.",
        badge: null,
      },
      {
        id: "burnouts",
        name: "Burnouts",
        image: "/assets/images/burnouts.png",
        link: BURNOUTS_URL,
        external: true,
        desc: "High-intensity burn challenges.",
        badge: null,
      },
      {
        id: "live",
        name: "Live",
        image: "/assets/images/live.png",
        link: "/live",
        external: false,
        desc: "Real-time rooms and matchups.",
        badge: LIVE_COMING_SOON ? "COMING SOON" : null,
      },
      {
        id: "run",
        name: "Run",
        image: "/assets/images/run.png",
        link: "/run",
        external: false,
        desc: "Cardio / run mode.",
        badge: null,
      },
    ],
    []
  );

  const handleCardClick = (mode) => {
    if (mode.badge === "COMING SOON") return; // disable click
    if (mode.external) {
      window.location.href = mode.link; // best for camera permissions on iOS
      return;
    }
    navigate(mode.link);
  };

  // --- Parallax background (mouse + touch) ---
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const onMove = (clientX, clientY) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;

      // -1..1
      const nx = (clientX / w) * 2 - 1;
      const ny = (clientY / h) * 2 - 1;

      // small offsets
      const x = clamp(nx * 14, -14, 14);
      const y = clamp(ny * 10, -10, 10);
      setParallax({ x, y });
    };

    const onMouseMove = (e) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (!e.touches || !e.touches[0]) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (!bgRef.current) return;
    bgRef.current.style.transform = `scale(1.06) translate3d(${parallax.x}px, ${parallax.y}px, 0)`;
  }, [parallax]);

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden bg-black">
      {/* --- Animated background image + parallax --- */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 will-change-transform transition-transform duration-200"
        style={{
          backgroundImage: "url(/assets/images/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.42) contrast(1.2) saturate(1.15)",
        }}
      />

      {/* --- Vignette + dark overlay for readability --- */}
      <div className="absolute inset-0 z-0 bg-black/55" />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 25%, rgba(255,0,60,0.18), transparent 60%), radial-gradient(900px 500px at 20% 90%, rgba(255,0,60,0.10), transparent 65%), radial-gradient(900px 500px at 80% 90%, rgba(0,255,210,0.06), transparent 65%)",
        }}
      />

      {/* --- Scanlines overlay --- */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-25 mix-blend-soft-light"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
        }}
      />

      {/* --- Content --- */}
      <div className="relative z-20 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_18px_rgba(255,0,60,0.9)] animate-pulse" />
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide">
                Rivalis Hub
              </h1>
            </div>
            <p className="text-white/75 mt-2 text-base md:text-lg">
              Choose your mode. Earn tickets. Win gear.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameModes.map((mode) => {
              const disabled = mode.badge === "COMING SOON";
              return (
                <button
                  key={mode.id}
                  onClick={() => handleCardClick(mode)}
                  disabled={disabled}
                  className={[
                    "group relative overflow-hidden rounded-2xl text-left",
                    "border bg-zinc-950/75 backdrop-blur-md",
                    "transition-all duration-200",
                    disabled
                      ? "border-white/10 opacity-70 cursor-not-allowed"
                      : "border-red-500/25 hover:-translate-y-1 hover:border-red-400/70 active:translate-y-0",
                    disabled
                      ? ""
                      : "hover:shadow-[0_0_38px_rgba(255,0,60,0.25)]",
                  ].join(" ")}
                >
                  {/* Neon edge + pulse layer */}
                  <div
                    className={[
                      "absolute inset-0 pointer-events-none",
                      disabled ? "opacity-30" : "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-200",
                    ].join(" ")}
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px rgba(255,0,60,0.35), 0 0 48px rgba(255,0,60,0.25)",
                      animation: disabled ? "none" : "neonPulse 2.4s ease-in-out infinite",
                    }}
                  />

                  {/* Image */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={mode.image}
                      alt={mode.name}
                      className={[
                        "h-full w-full object-cover",
                        "transition-all duration-200",
                        disabled
                          ? "opacity-70"
                          : "opacity-90 group-hover:opacity-100 group-hover:scale-[1.06]",
                      ].join(" ")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    {/* Badge */}
                    {mode.badge && (
                      <div className="absolute top-3 left-3">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider
                                     bg-black/70 border border-red-500/40 text-red-200
                                     shadow-[0_0_18px_rgba(255,0,60,0.25)]"
                        >
                          {mode.badge}
                        </span>
                      </div>
                    )}

                    {/* Corner glow */}
                    <div
                      className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full blur-2xl opacity-60"
                      style={{
                        background: "radial-gradient(circle, rgba(255,0,60,0.35), transparent 60%)",
                      }}
                    />
                  </div>

                  {/* Text */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{mode.name}</h2>
                      <span
                        className={[
                          "text-sm font-semibold transition-colors",
                          disabled ? "text-white/35" : "text-red-300 group-hover:text-red-200",
                        ].join(" ")}
                      >
                        {disabled ? "Locked" : "Enter →"}
                      </span>
                    </div>

                    <p className="text-white/60 text-sm mt-2">{mode.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer tip */}
          <div className="mt-10 text-white/45 text-sm">
            Tip: For camera modes, opening in the same tab helps permissions work smoothly.
          </div>
        </div>
      </div>

      {/* Keyframes for neon pulse */}
      <style>{`
        @keyframes neonPulse {
          0%, 100% {
            filter: drop-shadow(0 0 0 rgba(255,0,60,0.0));
            opacity: 0.95;
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(255,0,60,0.35));
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
