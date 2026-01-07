import React from 'react';

const TourStep = ({ step, onNext, onSkip }) => {
  const steps = [
    { title: "Upload Avatar", description: "Let's start by personalizing your look. Upload an avatar to stand out in the community!" },
    { title: "Profile & Achievements", description: "This is your hub. Track your bio, achievements, and milestones here." },
    { title: "Leaderboard & Social", description: "Check your rank on the leaderboard and connect with others in global chat and DMs." },
    { title: "Workout Modes", description: "Explore Solo Mode, Burnouts, Run Mode, and Live Mode for a complete fitness experience." },
    { title: "Shop", description: "Use your hard-earned rewards to get exclusive items in the shop." },
    { title: "Workout Plan", description: "Set up a personalized workout plan to stay on track (optional)." },
    { title: "All Set!", description: "You're ready to dominate. Let's get started!" }
  ];

  const currentStep = steps[step];

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