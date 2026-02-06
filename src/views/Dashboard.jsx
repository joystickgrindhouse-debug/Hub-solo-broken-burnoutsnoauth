import React from "react";
import { useNavigate } from "react-router-dom";

// ✅ Correct asset paths (your real files)
import soloImage from "../assets/images/solo.png";
import burnoutsImage from "../assets/images/burnouts.png";
import liveImage from "../assets/images/live.png";
import runImage from "../assets/images/run.png";

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ Your real deployed URLs
  const SOLO_URL = "https://riv-solo.vercel.app/";
  const BURNOUTS_URL = "https://burnouts.vercel.app/";

  const gameModes = [
    {
      id: "solo",
      name: "Solo",
      image: soloImage,
      link: SOLO_URL,
      external: true,
      desc: "AI rep detection. Solo grind mode.",
    },
    {
      id: "burnouts",
      name: "Burnouts",
      image: burnoutsImage,
      link: BURNOUTS_URL,
      external: true,
      desc: "High-intensity burn challenges.",
    },
    {
      id: "live",
      name: "Live",
      image: liveImage,
      link: "/live",
      external: false,
      desc: "Real-time rooms and matchups.",
    },
    {
      id: "run",
      name: "Run",
      image: runImage,
      link: "/run",
      external: false,
      desc: "Cardio tracking / run mode.",
    },
  ];

  const handleCardClick = (mode) => {
    if (mode.external) {
      // Same tab (best for camera permissions on iOS/Safari)
      window.location.href = mode.link;
      return;
    }
    navigate(mode.link);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
            Rivalis Hub
          </h1>
          <p className="text-white/70 mt-2">
            Choose your mode. Earn tickets. Win gear.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleCardClick(mode)}
              className="group relative overflow-hidden rounded-2xl border border-red-500/30 bg-zinc-950 hover:bg-zinc-900 transition-all duration-200 shadow-lg hover:shadow-red-500/20 text-left"
            >
              {/* Image */}
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={mode.image}
                  alt={mode.name}
                  className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              {/* Text */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{mode.name}</h2>
                  <span className="text-red-400 text-sm font-medium">
                    Enter →
                  </span>
                </div>

                <p className="text-white/60 text-sm mt-2">{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 text-white/40 text-sm">
          Tip: For camera modes, opening in the same tab helps permissions work
          smoothly.
        </div>
      </div>
    </div>
  );
}
