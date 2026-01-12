import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TourStep = ({ step, onNext, onSkip }) => {
  const navigate = useNavigate();
  const steps = [
    { 
      title: "NEURAL LINK ESTABLISHED", 
      description: "Welcome, Rival. I am your high-intelligence AI Fitness Coach. I've mapped the hub's mainframe to your neural link. Ready for initialization?",
      route: "/dashboard"
    },
    { 
      title: "SECTOR: PROFILE", 
      description: "Analyzing biometric data... This is your hub. Track achievements and milestones here. Your hard data is visualized for maximum optimization.",
      route: "/profile",
      highlight: ".profile-card, .stats-container"
    },
    { 
      title: "IDENTITY: AVATAR", 
      description: "NEURAL LINK CALIBRATION: Click the edit icon on your avatar to upload your own biometric image. Standing out in the sector is mandatory.",
      route: "/profile",
      highlight: ".avatar-edit-button, .avatar-image",
      action: "highlight_only"
    },
    { 
      title: "BIOMETRIC INTAKE", 
      description: "COACH: I require additional data points to optimize your training path. Answer the questions in the chat terminal below.",
      route: "/profile",
      action: "highlight_only"
    },
    { 
      title: "IDENTITY: BIO", 
      description: "DATA STREAM: This is your mission statement area. Define your tactical objectives here. This is the final step of identity calibration.",
      route: "/profile",
      highlight: ".profile-bio-section",
      action: "highlight_only"
    },
    { 
      title: "DATA: ACHIEVEMENTS", 
      description: "SCANNING LOWER SECTORS... I'm highlighting your current optimization milestones. These data points represent your initial tactical victories in the field.",
      route: "/profile",
      highlight: ".achievement-badge, .milestone-card",
      action: "highlight_only"
    },
    { 
      title: "NAVIGATION: HUB RETURN", 
      description: "MAINFRAME ACCESS: Use the tactical menu to execute a manual return to the primary dashboard. This is your primary interface control.",
      route: "/profile",
      highlight: ".menu-button, [aria-label='menu']",
      action: "highlight_only"
    },
    { 
      title: "COMMUNICATION: GLOBAL CHAT", 
      description: "NEURAL SYNC: Access the global data stream. Interface with other Rivals in real-time to exchange tactical intel.",
      route: "/chat",
      highlight: ".chat-container, .message-list"
    },
    { 
      title: "COMMUNICATION: DIRECT LINK", 
      description: "ENCRYPTED CHANNEL: Establish secure 1-on-1 neural links with specific Rivals for private tactical coordination.",
      route: "/dm",
      highlight: ".dm-container, .user-list"
    },
    { 
      title: "SECTOR: SOLO MODE", 
      description: "Calibrating neural link... Our camera-based AI protocol. Note: Initializing the camera array may take a moment. Prepare for biometric tracking.",
      route: "/solo",
      highlight: ".solo-camera-preview, .rep-counter"
    },
    { 
      title: "SECTOR: BURNOUTS", 
      description: "Accessing combat data... High-intensity data streams. Category-specific grinds designed to push your biological limits.",
      route: "/burnouts",
      highlight: ".burnout-tiles, .mode-selector"
    },
    { 
      title: "SECTOR: RAFFLE ROOM", 
      description: "Calculating rewards... Your hard work earns raffle tickets. These are entries for weekly elite-level rewards.",
      route: "/raffle",
      highlight: ".ticket-count, .prize-display"
    },
    { 
      title: "SECTOR: LEADERBOARD", 
      description: "Syncing global rankings... Compare your optimization stats against every active Rival in this sector. Dominance is the objective.",
      route: "/leaderboard",
      highlight: ".leaderboard-table, .rank-row"
    },
    { 
      title: "INITIALIZATION COMPLETE", 
      description: "Tour protocol finalized. The hub is yours to dominate. Go out-train, out-rival, and out-perform.",
      route: "/dashboard"
    }
  ];

  const currentStep = steps[step];

  useEffect(() => {
    if (currentStep && currentStep.route) {
      if (window.location.pathname !== currentStep.route) {
        navigate(currentStep.route);
      }
      
      // Handle special actions
      if (currentStep.action === "scroll_bottom") {
        setTimeout(() => {
          const achievements = document.querySelector('.achievements-section');
          if (achievements) {
            achievements.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 800);
      } else if (currentStep.action === "navigate_home_demo") {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          const menuBtn = document.querySelector('.menu-button') || document.querySelector('[aria-label="menu"]');
          if (menuBtn) {
            menuBtn.style.transition = 'all 0.3s ease';
            menuBtn.style.boxShadow = '0 0 30px #FF0000';
            menuBtn.style.border = '2px solid #FF0000';
            
            setTimeout(() => {
              menuBtn.click();
              setTimeout(() => {
                const homeBtn = Array.from(document.querySelectorAll('button, a')).find(el => 
                  el.textContent.toLowerCase().includes('home') || el.textContent.toLowerCase().includes('dashboard')
                );
                if (homeBtn) {
                  homeBtn.style.transition = 'all 0.3s ease';
                  homeBtn.style.boxShadow = '0 0 30px #FF0000';
                  homeBtn.style.border = '2px solid #FF0000';
                  setTimeout(() => {
                    homeBtn.click();
                  }, 1500);
                }
              }, 1000);
            }, 1500);
          }
        }, 1000);
      }

      // Flash highlight effect
      if (currentStep.highlight) {
        setTimeout(() => {
          const elements = document.querySelectorAll(currentStep.highlight);
          elements.forEach(el => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = 'all 0.3s ease';
            el.style.boxShadow = '0 0 30px #FF0000, inset 0 0 20px #FF0000';
            el.style.border = '2px solid #FF0000';
            
            setTimeout(() => {
              el.style.boxShadow = '';
              el.style.border = '';
            }, 1500);
          });
        }, 500);
      }
    }
  }, [step, navigate, currentStep]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{currentStep.title}</h3>
      <p style={styles.description}>{currentStep.description}</p>
      <div style={styles.buttonContainer}>
        {step < steps.length - 1 ? (
          <>
            <button style={styles.skipButton} onClick={onSkip}>Skip</button>
            <button style={styles.nextButton} onClick={onNext}>Next</button>
          </>
        ) : (
          <button style={styles.finishButton} onClick={onNext}>Finish</button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.9)',
    border: '2px solid #FF0000',
    borderRadius: '12px',
    boxShadow: '0 0 15px #FF0000',
    color: '#FFF',
    maxWidth: '300px',
  },
  title: {
    color: '#FF0000',
    textShadow: '0 0 10px #FF0000',
    marginBottom: '10px',
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.4',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  nextButton: {
    background: '#FF0000',
    color: '#FFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  skipButton: {
    background: 'transparent',
    color: '#FFF',
    border: '1px solid #FFF',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  finishButton: {
    background: '#FF0000',
    color: '#FFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  }
};

export default TourStep;