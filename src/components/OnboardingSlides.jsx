import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function OnboardingSlides({ onComplete }) {
  const t = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "GAMIFIED WORKOUTS",
      description: "Track your reps and dominate challenges",
      icon: "💪"
    },
    {
      title: "GAMIFIED TRAINING",
      description: "Solo mode, Burnouts, Live challenges & more game modes",
      icon: "🎮"
    },
    {
      title: "COMPETE & CONNECT",
      description: "Global leaderboards, achievements, and real-time chat",
      icon: "🏆"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        onComplete();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentSlide, onComplete, slides.length]);

  return (
    <div className="hero-background" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "600px",
        width: "90%",
        background: "rgba(0, 0, 0, 0.85)",
        border: `2px solid ${t.accent}`,
        borderRadius: "12px",
        padding: "3rem 2rem",
        boxShadow: `0 0 30px ${t.shadowMd}, inset 0 0 20px ${t.shadowXxs}`,
        animation: "slideIn 0.5s ease-out"
      }}>
        <div style={{
          fontSize: "4rem",
          textAlign: "center",
          marginBottom: "1.5rem",
          animation: "iconPulse 1s ease-in-out infinite"
        }}>
          {slides[currentSlide].icon}
        </div>
        
        <h2 style={{ 
          fontFamily: "'Press Start 2P', cursive",
          color: t.accent,
          fontSize: "clamp(1rem, 3vw, 1.5rem)",
          fontWeight: "normal",
          textTransform: "uppercase",
          letterSpacing: "2px",
          textAlign: "center",
          lineHeight: "1.8",
          textShadow: `
            0 0 10px ${t.shadow},
            0 0 20px ${t.shadowMd},
            0 0 30px ${t.shadowSm}
          `,
          marginBottom: "1.5rem",
          animation: "fadeInUp 0.6s ease-out"
        }}>
          {slides[currentSlide].title}
        </h2>

        <p style={{
          color: "#fff",
          fontSize: "1rem",
          textAlign: "center",
          lineHeight: "1.8",
          marginBottom: "2rem",
          opacity: 0.9,
          animation: "fadeInUp 0.8s ease-out"
        }}>
          {slides[currentSlide].description}
        </p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.8rem",
          alignItems: "center"
        }}>
          {slides.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentSlide ? "40px" : "12px",
                height: "12px",
                borderRadius: "6px",
                backgroundColor: index === currentSlide ? t.accent : t.shadowSm,
                boxShadow: index === currentSlide ? `0 0 10px ${t.shadow}` : "none",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
