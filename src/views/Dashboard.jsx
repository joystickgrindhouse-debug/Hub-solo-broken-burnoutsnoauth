import React, { useMemo, useState } from "react";
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
      draggable={false}
    />
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const SOLO_URL = "https://riv-solo.vercel.app/";
  const BURNOUTS_URL = "https://burnouts.vercel.app/";
  const LIVE_COMING_SOON = false;

  const [showComingSoon, setShowComingSoon] = useState(false);

  const modes = useMemo(
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
        name: "Merch Shop",
        image: "/assets/images/shop.png.png",
        link: "/merch",
        external: false,
        desc: "Buy official Rivalis merch.",
        badge: "SHOP",
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
      { id: "store", name: "More Drops", desc: "More merch + surprise drops." },
    ],
    []
  );

  const handleClick = (mode) => {
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

  return (
    <>
      <div className="px-3 sm:px-4 py-7 pb-[calc(18px+env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-5">
            <div className="inline-flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_18px_rgba(255,0,60,0.9)] animate-pulse" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">Rivalis</h1>
            </div>
            <p className="text-white/75 mt-2 text-sm sm:text-base">
              Fitness Reimagined — Get Hooked. Outtrain. Outrival.
            </p>
          </div>

          {/* Compact PNG buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleClick(mode)}
                className={[
                  "group relative overflow-hidden rounded-2xl text-left",
                  "border bg-zinc-950/70 backdrop-blur-md",
                  "transition-all duration-200",
                  "min-h-[74px] sm:min-h-[92px]",
                  mode.comingSoon
                    ? "border-white/10 opacity-85"
                    : "border-red-500/25 hover:border-red-400/70 active:scale-[0.99] hover:shadow-[0_0_28px_rgba(255,0,60,0.22)]",
                ].join(" ")}
              >
                {!mode.comingSoon && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px rgba(255,0,60,0.35), 0 0 38px rgba(255,0,60,0.2)",
                    }}
                  />
                )}

                <div className="relative flex items-center gap-3 p-2.5 sm:p-3">
                  {/* PNG icon */}
                  <div className="relative flex-none h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden border border-red-500/25 bg-black/40">
                    <SafeImg src={mode.image} alt={mode.name} className="h-full w-full object-cover opacity-95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm sm:text-base font-semibold truncate">{mode.name}</span>

                          {(mode.badge || mode.comingSoon) && (
                            <span className="inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-bold tracking-wider bg-black/70 border border-red-500/40 text-red-200">
                              {mode.comingSoon ? "COMING SOON" : mode.badge}
                            </span>
                          )}
                        </div>

                        <div className="text-white/60 text-[11px] sm:text-sm mt-0.5 leading-tight line-clamp-1">
                          {mode.desc}
                        </div>
                      </div>

                      <span className="text-red-300 text-[11px] sm:text-sm font-semibold whitespace-nowrap">
                        {mode.comingSoon ? "Soon" : "Go →"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowComingSoon(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-red-500/30 bg-zinc-950/90 backdrop-blur-md shadow-[0_0_50px_rgba(255,0,60,0.18)] overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-wide">Coming Soon</h3>
              <button onClick={() => setShowComingSoon(false)} className="text-white/70 hover:text-white transition-colors">
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
    </>
  );
}
