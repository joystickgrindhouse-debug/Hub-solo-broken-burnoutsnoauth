import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function SafeImg({ src, alt, className }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? "/assets/images/fallback.png" : src}
      alt={alt}
      className={className}
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const bgRef = useRef(null);

  // External URLs
  const SOLO_URL = "https://riv-solo.vercel.app/";
  const BURNOUTS_URL = "https://burnouts.vercel.app/";

  // If you want to show Live as coming soon, set true
  const LIVE_COMING_SOON = false;

  const [showComingSoon, setShowComingSoon] = useState(false);

  const cards = useMemo(
    () => [
      {
        id: "solo",
        name: "Solo",
        image: "/assets/images/solo.png.png",
        link: SOLO_URL,
        external: true,
        desc: "AI rep detection. Solo grind mode.",
        badge: null,
        comingSoon: false,
      },
      {
        id: "burnouts",
        name: "Burnouts",
        image: "/assets/images/burnouts.png.png",
        link: BURNOUTS_URL,
        external: true,
        desc: "High-intensity burn challenges.",
        badge: null,
        comingSoon: false,
      },
      {
        id: "live",
        name: "Live",
        image: "/assets/images/live.png.png",
        link: "/live",
        external: false,
        desc: "Real-time rooms and matchups.",
        badge: LIVE_COMING_SOON ? "COMING SOON" : "LIVE",
        comingSoon: LIVE_COMING_SOON,
      },
      {
        id: "run",
        name: "Run",
        image: "/assets/images/run.png.png",
        link: "/run",
        external: false,
        desc: "Cardio / run mode.",
        badge: null,
        comingSoon: false,
      },
      {
        id: "raffle",
        name: "Raffle",
        image: "/assets/images/raffle.png.png",
        link: "/raffle",
        external: false,
        desc: "Tickets, entries, and drawings.",
        badge: null,
        comingSoon: false,
      },
      {
        id: "shop",
        name: "Shop",
        image: "/assets/images/shop.png.png",
        link: "/merch", // your MerchShop.jsx iframe page
        external: false,
        desc: "Official Rivalis merch shop.",
        badge: "MERCH",
        comingSoon: false,
      },
      {
        id: "comingsoon",
        name: "Coming Soon",
        image: "/assets/images/comingsoon.png.png",
        link: "#",
        external: false,
        desc: "New modes and upgrades on the way.",
        badge: null,
        comingSoon: true,
      },
    ],
    []
  );

  const futureApps = useMemo(
    () => [
      { id: "tournaments", name: "Tournaments", desc: "Bracket battles + prize pools." },
      { id: "arena", name: "Arena", desc: "Ranked battles + seasonal rewards." },
      { id: "clans", name: "Clans", desc: "Teams, rivalries, clan leaderboards." },
      { id: "store", name: "Ticket Store", desc: "Redeem tickets for drops and gear." },
    ],
    []
  );

  const handleCardClick = (mode) => {
    if (mode.comingSoon) {
      setShowComingSoon(true);
      return;
    }
    if (mode.external) {
      window.location.href = mode.link;
      return;
    }
    navigate(mode.link);
  };

  // Parallax background
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const onMove = (clientX, clientY) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (clientX / w) * 2 - 1;
      const ny = (clientY / h) * 2 - 1;
      setParallax({ x: clamp(nx * 14, -14, 14), y: clamp(ny * 10, -10, 10) });
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
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% 25%, rgba(255,0,60,0.18), transparent 60%), radial-gradient(900px 500px at 20% 90%, rgba(255,0,60,0.10), transparent 65%), radial-gradient(900px 500px at 80% 90%, rgba(0,255,210,0.06), transparent 65%)",
        }}
      />

      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-25 mix-blend-soft-light"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
        }}
      />

      {/* MOBILE FIRST */}
      <div className="relative z-20 px-3 sm:px-4 py-7 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-5 sm:mb-10">
            <div className="inline-flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_18px_rgba(255,0,60,0.9)] animate-pulse" />
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-wide">
                Rivalis
              </h1>
            </div>
            <p className="text-white/75 mt-2 text-sm sm:text-base md:text-lg">
              Fitness Reimagined — Get Hooked. Outtrain. Outrival.
            </p>
          </div>

          {/* 2 COLS ON PHONES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-5">
            {cards.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleCardClick(mode)}
                className={[
                  "group relative overflow-hidden rounded-2xl text-left flex flex-col",
                  "h-[168px] sm:h-[210px] lg:h-[230px]",
                  "border bg-zinc-950/75 backdrop-blur-md",
                  "transition-all duration-200",
                  mode.comingSoon
                    ? "border-white/10 opacity-90 hover:shadow-[0_0_30px_rgba(255,0,60,0.18)]"
                    : "border-red-500/25 hover:-translate-y-1 hover:border-red-400/70 active:translate-y-0 hover:shadow-[0_0_38px_rgba(255,0,60,0.25)]",
                ].join(" ")}
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px rgba(255,0,60,0.35), 0 0 48px rgba(255,0,60,0.25)",
                    animation: "neonPulse 2.4s ease-in-out infinite",
                  }}
                />

                {/* SMALL IMAGE BLOCK */}
                <div className="relative flex-none h-[88px] sm:h-[120px] lg:h-[132px] w-full overflow-hidden">
                  <SafeImg
                    src={mode.image}
                    alt={mode.name}
                    className="h-full w-full object-cover opacity-90 transition-all duration-200 group-hover:opacity-100 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {(mode.badge || mode.comingSoon) && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider bg-black/70 border border-red-500/40 text-red-200 shadow-[0_0_18px_rgba(255,0,60,0.25)]">
                        {mode.comingSoon ? "COMING SOON" : mode.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* COMPACT TEXT */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <h2 className="text-sm sm:text-lg font-semibold leading-tight truncate">
                      {mode.name}
                    </h2>
                    <span className="text-red-300 group-hover:text-red-200 text-[10px] sm:text-sm font-semibold transition-colors whitespace-nowrap">
                      Enter →
                    </span>
                  </div>

                  {/* Hide desc on mobile so tiles stay small */}
                  <p className="hidden sm:block text-white/60 text-sm mt-2 line-clamp-2">
                    {mode.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showComingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowComingSoon(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-red-500/30 bg-zinc-950/90 backdrop-blur-md shadow-[0_0_50px_rgba(255,0,60,0.18)] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-wide">Coming Soon</h3>
              <button
                onClick={() => setShowComingSoon(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3">
              {futureApps.map((app) => (
                <div key={app.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="font-semibold">{app.name}</div>
                  <div className="text-white/55 text-sm mt-1">{app.desc}</div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowComingSoon(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes neonPulse {
          0%, 100% { opacity: 0.95; filter: drop-shadow(0 0 0 rgba(255,0,60,0.0)); }
          50% { opacity: 1; filter: drop-shadow(0 0 18px rgba(255,0,60,0.35)); }
        }
      `}</style>
    </div>
  );
}
