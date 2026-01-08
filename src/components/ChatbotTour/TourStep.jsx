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
      description: "This is your hub. Track your bio, achievements, and milestones here. Your hard data is visualized for maximum optimization.",
      route: "/profile"
    },
    { 
      title: "SECTOR: SOLO MODE", 
      description: "Our camera-based AI protocol. It tracks your bio-metrics in real-time, counting every rep with mathematical precision.",
      route: "/solo"
    },
    { 
      title: "SECTOR: BURNOUTS", 
      description: "High-intensity data streams. Category-specific grinds designed to push your biological limits.",
      route: "/burnouts"
    },
    { 
      title: "SECTOR: RAFFLE ROOM", 
      description: "Your hard work earns raffle tickets. These are your entries for weekly elite-level rewards in the mainframe.",
      route: "/raffle"
    },
    { 
      title: "SECTOR: LEADERBOARD", 
      description: "The global rankings mainframe. Compare your optimization stats against every Rival in this sector.",
      route: "/leaderboard"
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
      navigate(currentStep.route);
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