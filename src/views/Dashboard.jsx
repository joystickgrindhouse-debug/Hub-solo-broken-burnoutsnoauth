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
  const MERCH_URL = "https://rivalis.printful.me";

  const [showComingSoon, setShowComingSoon] = useState(false);

  const modes = useMemo(
    () => [
      { id: "solo", name: "Solo", image: "/assets/images/solo.png.png", link: SOLO_URL, external: true },
      { id: "burnouts", name: "Burnouts", image: "/assets/images/burnouts.png.png", link: BURNOUTS_URL, external: true },
      { id: "live", name: "Live", image: "/assets/images/live.png.png", link: "/live", external: false },
      { id: "run", name: "Run", image: "/assets/images/run.png.png", link: "/run", external: false },
      { id: "raffle", name: "Raffle", image: "/assets/images/raffle.png.png", link: "/raffle", external: false },
      { id: "shop", name: "Merch", image: "/assets/images/shop.png.png", link: MERCH_URL, external: true },
      { id: "soon", name: "Soon", image: "/assets/images/comingsoon.png.png", link: "#", external: false, comingSoon: true },
    ],
    []
  );

  const handleClick = (mode) => {
    if (mode.comingSoon) {
      setShowComingSoon(true);
      return;
    }
    if (mode.external) {
      if (typeof window.launchGame === 'function') {
        window.launchGame(mode.link);
      } else {
        window.open(mode.link, "_blank", "noopener,noreferrer");
      }
      return;
    }
    navigate(mode.link);
  };

  return (
    <div className="px-3 py-6 pb-[calc(18px+env(safe-area-inset-bottom))] min-h-screen flex flex-col">
      <div className="max-w-xs mx-auto w-full flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_18px_rgba(255,0,60,0.9)]" />
            <h1 className="text-xl font-extrabold tracking-wide">Rivalis</h1>
          </div>
          <p className="text-white/70 text-xs mt-1">Pick a mode.</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleClick(mode)}
              className="relative rounded-lg overflow-hidden border border-red-500/25 bg-zinc-950/70 backdrop-blur-md active:scale-[0.97] transition aspect-square"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1">
                <div className="w-7 h-7 rounded-md overflow-hidden border border-white/10 bg-black/40">
                  <SafeImg src={mode.image} alt={mode.name} className="h-full w-full object-cover" />
                </div>
                <div className="text-[8px] font-bold text-white/90 leading-tight uppercase tracking-tight">
                  {mode.name}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </button>
          ))}
        </div>
      </div>

      {/* Coming soon modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowComingSoon(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/30 bg-zinc-950/90 backdrop-blur-md p-5">
            <div className="text-lg font-bold">Coming Soon</div>
            <div className="text-white/70 text-sm mt-1">
              New modes + upgrades are on the way.
            </div>
            <button
              onClick={() => setShowComingSoon(false)}
              className="mt-4 w-full px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
