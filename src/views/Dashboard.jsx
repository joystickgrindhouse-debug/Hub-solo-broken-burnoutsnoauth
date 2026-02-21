import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SafeImg({ src, alt, className, style }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={err ? "/assets/images/fallback.png" : src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErr(true)}
      loading="lazy"
      draggable={false}
    />
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const modes = [
    { id: "solo", name: "Solo", image: "/attached_assets/generated_images/rivalis_hub_burnouts_card_ui_mockup.png", link: "/solo" },
    { id: "burnouts", name: "Burnouts", image: "/attached_assets/generated_images/retro_neon_boxing_tile_image.png", link: "/burnouts" },
    { id: "run", name: "Run", image: "/attached_assets/generated_images/neon_red_runners_on_dark_track.png", link: "/run" },
    { id: "raffle", name: "Raffle Room", image: "/attached_assets/generated_images/rivalis_hub_raffle_drawing_mockup.png", link: "/raffle" },
    { id: "shop", name: "Merch Shop", image: "/attached_assets/generated_images/rivalis_hub_leaderboard_advertisement_mockup.png", link: "/shop" },
  ];

  function handleClick(link) {
    if (typeof link === 'string') navigate(link);
  }

  return (
    <div className="hub-homepage">
      <header className="hub-header">
        <div className="hub-brand">RIVALIS HUB</div>
        <div className="hub-right">
          <div className="hub-avatar">Tester</div>
          <button className="hub-menu">Menu</button>
        </div>
      </header>

      <section className="hub-hero" style={{ backgroundImage: "url('/attached_assets/Rivalis_Fitness_Reimagined_1767900329545.jpeg')" }}>
        <div className="hero-inner">
          <div className="hero-title-small">RIVALIS</div>
          <div className="hero-title-large">FITNESS</div>
          <div className="hero-title-large">REIMAGINED</div>

          <div className="card-grid">
            {modes.map((m) => (
              <button key={m.id} className="hub-tile" onClick={() => handleClick(m.link)}>
                <div className="tile-image-wrap">
                  <SafeImg src={m.image} alt={m.name} />
                </div>
                <div className="tile-label">{m.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={`ai-chatbot chat-widget ${chatOpen ? 'open' : 'collapsed'}`} data-type="ai-chat">
          <div className="chat-header">
            <span>RIVALIS CHATBOT AI</span>
            <button className="chat-close" onClick={() => setChatOpen(false)} aria-label="close ai chat">×</button>
          </div>
          <div className="chat-messages">
            <div className="msg bot">Hey Rival! I'm your new AI Fitness Coach. Ready for a quick tour?</div>
            <div className="msg user">Hello</div>
            <div className="msg bot">My neural link is flickering, Rival. Try again in a moment.</div>
          </div>
          <div className="chat-input"><input placeholder="Ask me anything..." /><button>▶</button></div>
        </div>

        {!chatOpen && <button className="chat-toggle" onClick={() => setChatOpen(true)} aria-label="open ai chat">AI</button>}

        <div className="bottom-bar" />
      </section>
    </div>
  );
}


