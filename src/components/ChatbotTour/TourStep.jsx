import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';

const TOUR_STEPS = [
  { 
    title: "NEURAL LINK ESTABLISHED", 
    description: "Welcome, Rival. I am your high-intelligence AI Fitness Coach. I've mapped the hub's mainframe to your neural link. Ready for initialization?",
    route: "/dashboard",
    icon: "🔗"
  },
  { 
    title: "SECTOR: PROFILE", 
    description: "This is your command center. Track achievements, milestones, and performance data — all visualized for maximum optimization.",
    route: "/profile",
    highlight: ".profile-card, .stats-container",
    icon: "👤"
  },
  { 
    title: "IDENTITY: AVATAR", 
    description: "Click the edit icon on your avatar to upload a custom image. Your identity in the sector matters — stand out.",
    route: "/profile",
    highlight: ".avatar-edit-button, .avatar-image",
    action: "highlight_only",
    icon: "🎭"
  },
  { 
    title: "BIOMETRIC INTAKE", 
    description: "I need additional data points to build your training path. Answer the questions in the chat terminal below.",
    route: "/profile",
    action: "highlight_only",
    icon: "📊"
  },
  { 
    title: "IDENTITY: BIO", 
    description: "Define your mission statement here. This is the final step of identity calibration — tell us what drives you.",
    route: "/profile",
    highlight: ".profile-bio-section",
    action: "highlight_only",
    icon: "📝"
  },
  { 
    title: "ACHIEVEMENTS", 
    description: "Your optimization milestones are tracked here. These represent your tactical victories and progress streaks.",
    route: "/profile",
    highlight: ".achievement-badge, .milestone-card",
    action: "highlight_only",
    icon: "🏆"
  },
  { 
    title: "NAVIGATION", 
    description: "Use the menu to navigate between sectors. This is your primary interface control — master it.",
    route: "/profile",
    highlight: ".menu-button, [aria-label='menu']",
    action: "highlight_only",
    icon: "🧭"
  },
  { 
    title: "GLOBAL CHAT", 
    description: "Access the global data stream. Interface with other Rivals in real-time to exchange intel and build your network.",
    route: "/chat",
    highlight: ".chat-container, .message-list",
    icon: "💬"
  },
  { 
    title: "DIRECT MESSAGES", 
    description: "Establish private 1-on-1 channels with specific Rivals for tactical coordination and accountability.",
    route: "/dm",
    highlight: ".dm-container, .user-list",
    icon: "🔒"
  },
  { 
    title: "SOLO MODE", 
    description: "Camera-based AI workout tracking. The system detects your movements and counts reps automatically. Prepare for biometric tracking.",
    route: "/solo",
    highlight: ".solo-camera-preview, .rep-counter",
    icon: "🎯"
  },
  { 
    title: "BURNOUTS", 
    description: "High-intensity category grinds — Arms, Legs, Core, or Full Body. Designed to push your biological limits to the edge.",
    route: "/burnouts",
    highlight: ".burnout-tiles, .mode-selector",
    icon: "🔥"
  },
  { 
    title: "RAFFLE ROOM", 
    description: "Your hard work earns raffle tickets — 1 ticket per 30 reps. Entries for weekly elite-level prize draws.",
    route: "/raffle",
    highlight: ".ticket-count, .prize-display",
    icon: "🎟️"
  },
  { 
    title: "LEADERBOARD", 
    description: "Compare your stats against every active Rival. Rankings update in real-time across all game modes. Dominance is the objective.",
    route: "/leaderboard",
    highlight: ".leaderboard-table, .rank-row",
    icon: "📈"
  },
  { 
    title: "INITIALIZATION COMPLETE", 
    description: "Tour protocol finalized. The hub is yours to dominate. Go out-train, out-rival, and out-perform. Welcome to the sector.",
    route: "/dashboard",
    icon: "✅"
  }
];

const TourStep = ({ step, onNext, onSkip }) => {
  const navigate = useNavigate();
  const t = useTheme();
  const [transitioning, setTransitioning] = useState(false);
  const [entered, setEntered] = useState(false);

  const currentStep = TOUR_STEPS[step] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  useEffect(() => {
    setEntered(false);
    const enterTimer = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(enterTimer);
  }, [step]);

  useEffect(() => {
    if (currentStep && currentStep.route) {
      if (window.location.pathname !== currentStep.route) {
        navigate(currentStep.route);
      }
      
      if (currentStep.action === "scroll_bottom") {
        setTimeout(() => {
          const achievements = document.querySelector('.achievements-section');
          if (achievements) {
            achievements.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
          }
        }, 800);
      }

      if (currentStep.highlight) {
        setTimeout(() => {
          const elements = document.querySelectorAll(currentStep.highlight);
          elements.forEach(el => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = 'all 0.5s ease';
            el.style.boxShadow = `0 0 30px ${t.accent}, inset 0 0 20px ${t.shadowXs}`;
            el.style.border = `2px solid ${t.accent}`;
            
            setTimeout(() => {
              el.style.boxShadow = '';
              el.style.border = '';
            }, 2000);
          });
        }, 600);
      }
    }
  }, [step, navigate, currentStep]);

  const handleNext = () => {
    setTransitioning(true);
    setTimeout(() => {
      onNext();
      setTransitioning(false);
    }, 200);
  };

  const handleSkip = () => {
    setTransitioning(true);
    setTimeout(() => {
      onSkip();
      setTransitioning(false);
    }, 200);
  };

  const styles = getStyles(t);

  return (
    <div style={{
      ...styles.container,
      opacity: entered && !transitioning ? 1 : 0,
      transform: entered && !transitioning ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      <div style={styles.progressWrapper}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>
      <div style={styles.stepCounter}>
        STEP {step + 1} OF {totalSteps}
      </div>
      
      <div style={styles.iconRow}>
        <span style={styles.icon}>{currentStep.icon}</span>
      </div>
      
      <h3 style={styles.title}>{currentStep.title}</h3>
      <p style={styles.description}>{currentStep.description}</p>
      
      <div style={styles.buttonContainer}>
        {step < totalSteps - 1 ? (
          <>
            <button style={styles.skipButton} onClick={handleSkip}>SKIP</button>
            <button style={styles.nextButton} onClick={handleNext}>
              NEXT
              <span style={styles.nextArrow}>→</span>
            </button>
          </>
        ) : (
          <button style={styles.finishButton} onClick={handleNext}>
            ENTER THE SECTOR
          </button>
        )}
      </div>
    </div>
  );
};

const getStyles = (t) => ({
  container: {
    padding: '20px',
    background: 'linear-gradient(180deg, rgba(15,15,15,0.98) 0%, rgba(5,5,5,0.98) 100%)',
    border: `1px solid ${t.shadowSm}`,
    borderRadius: '16px',
    boxShadow: `0 0 40px ${t.shadowXs}, 0 8px 32px rgba(0,0,0,0.6)`,
    color: '#FFF',
    maxWidth: '320px',
    width: '92%',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  },
  progressWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: t.shadowXs,
    borderRadius: '3px 3px 0 0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: `linear-gradient(90deg, ${t.accent}, #ff4040)`,
    borderRadius: '3px',
    transition: 'width 0.5s ease',
    boxShadow: `0 0 8px ${t.accent}`,
  },
  stepCounter: {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '2px',
    textAlign: 'center',
    marginTop: '8px',
    marginBottom: '12px',
    fontFamily: "'Press Start 2P', cursive",
  },
  iconRow: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  icon: {
    fontSize: '28px',
    display: 'inline-block',
    filter: `drop-shadow(0 0 6px ${t.shadowSm})`,
  },
  title: {
    color: t.accent,
    textShadow: `0 0 12px ${t.shadowMd}`,
    marginBottom: '10px',
    fontSize: '13px',
    fontFamily: "'Press Start 2P', cursive",
    lineHeight: '1.4',
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  description: {
    fontSize: '13px',
    lineHeight: '1.6',
    marginBottom: '20px',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  nextButton: {
    background: `linear-gradient(135deg, ${t.accent}, #cc0000)`,
    color: '#FFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    fontFamily: "'Press Start 2P', cursive",
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: `0 2px 10px ${t.shadowSm}`,
    flex: 1,
    justifyContent: 'center',
  },
  nextArrow: {
    fontSize: '14px',
    transition: 'transform 0.2s ease',
  },
  skipButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.4)',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: "'Press Start 2P', cursive",
    transition: 'all 0.2s ease',
  },
  finishButton: {
    background: `linear-gradient(135deg, ${t.accent}, #cc0000)`,
    color: '#FFF',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    fontSize: '11px',
    fontFamily: "'Press Start 2P', cursive",
    boxShadow: `0 2px 15px ${t.shadowSm}`,
    transition: 'all 0.2s ease',
    letterSpacing: '1px',
  }
});

export { TOUR_STEPS };
export default TourStep;
