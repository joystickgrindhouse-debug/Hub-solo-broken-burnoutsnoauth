import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const SOLO_URL = "https://riv-solo.vercel.app/";
  const BURNOUTS_URL = "https://burnouts.vercel.app/";

  const gameModes = [
    {
      id: "solo",
      name: "Solo",
      image: "/assets/images/solo.png",
      link: SOLO_URL,
      external: true,
      desc: "AI rep detection. Solo grind mode.",
    },
    {
      id: "burnouts",
      name: "Burnouts",
      image: "/assets/images/burnouts.png",
      link: BURNOUTS_URL,
      external: true,
      desc: "High-intensity burn challenges.",
    },
    {
      id: "live",
      name: "Live",
      image: "/assets/images/live.png",
      link: "/live",
      external: false,
      desc: "Real-time rooms and matchups.",
    },
    {
      id: "run",
      name: "Run",
      image: "/assets/images/run.png",
      link: "/run",
      external: false,
      desc: "Cardio / run mode.",
    },
  ];

  const handleCardClick = (mode) => {
    if (mode.external) window.location.href = mode.link;
    else navigate(mode.link);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
            Rivalis Hub
          </h1>
          <p className="text-white/70 mt-2">
            Choose your mode. Earn tickets. Win gear.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleCardClick(mode)}
              className="group relative overflow-hidden rounded-2xl border border-red-500/30 bg-zinc-950 hover:bg-zinc-900 transition-all duration-200 shadow-lg hover:shadow-red-500/20 text-left"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={mode.image}
                  alt={mode.name}
                  className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{mode.name}</h2>
                  <span className="text-red-400 text-sm font-medium">Enter →</span>
                </div>
                <p className="text-white/60 text-sm mt-2">{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
