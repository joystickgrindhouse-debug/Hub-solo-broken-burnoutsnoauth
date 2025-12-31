import React, { useState, useEffect } from "react";

export default function OnboardingSlides({ onComplete }) {
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
        // All slides shown, trigger completion
        onComplete();
      }
    }, 4000); // 4 seconds per slide

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
        border: "2px solid #ff3050",
        borderRadius: "12px",
        padding: "3rem 2rem",
        boxShadow: "0 0 30px rgba(255, 48, 80, 0.5), inset 0 0 20px rgba(255, 48, 80, 0.05)",
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
          color: "#ff3050",
          fontSize: "clamp(1rem, 3vw, 1.5rem)",
          fontWeight: "normal",
          textTransform: "uppercase",
          letterSpacing: "2px",
          textAlign: "center",
          lineHeight: "1.8",
          textShadow: `
            0 0 10px rgba(255, 48, 80, 0.8),
            0 0 20px rgba(255, 48, 80, 0.6),
            0 0 30px rgba(255, 48, 80, 0.4)
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

        {/* Progress dots */}
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
                backgroundColor: index === currentSlide ? "#ff3050" : "rgba(255, 48, 80, 0.3)",
                boxShadow: index === currentSlide ? "0 0 10px rgba(255, 48, 80, 0.8)" : "none",
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
