import React, { useState, useEffect } from 'react';

const CoachsCorner = () => {
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(true);

  const tips = [
    "RE-FUELING PROTOCOL: High-intensity sectors require immediate glycogen replenishment. Aim for 30g protein within 30 minutes of session termination.",
    "HYDRATION STATUS: Neural links function optimally when hydration levels are at 100%. Drink 500ml of electrolyte-enhanced fluid before entering Solo Mode.",
    "RECOVERY PHASE: Sleep is the ultimate bio-metric upgrade. 8 hours of downtime ensures maximum hormonal optimization for the next grind.",
    "BIO-MECHANICAL TIP: During squats, ensure your weight is centered through the mid-foot. Perfect alignment prevents system failure.",
    "MOTIVATIONAL DATA: Every rep is a step toward total optimization. The mainframe records every struggle. Stay focused, Rival.",
    "EFFICIENCY PROTOCOL: Combine strength and cardio in one session for maximum metabolic burn. Out-train the competition.",
    "NUTRITIONAL ADVICE: Fiber is the silent optimizer. Ensure 25g daily for consistent energy levels during high-stress missions.",
    "MINDSET SHIFT: Pain is just temporary data. Progress is permanent. Keep pushing past your biological limits."
  ];

  useEffect(() => {
    // Simulate AI generation or fetch from backend
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTip(randomTip);
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>COACH'S CORNER</h3>
      <div style={styles.content}>
        <p style={styles.tipText}>{tip}</p>
      </div>
      <div style={styles.footer}>
        <span style={styles.status}>AI STATUS: OPTIMIZING</span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#111',
    border: '2px solid #FF3050',
    borderRadius: '12px',
    padding: '15px',
    marginTop: '20px',
    boxShadow: '0 0 15px rgba(255, 48, 80, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    color: '#FF3050',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '0.8rem',
    margin: '0 0 15px 0',
    textShadow: '0 0 5px #FF3050',
  },
  content: {
    background: 'rgba(255, 48, 80, 0.05)',
    borderLeft: '4px solid #FF3050',
    padding: '10px 15px',
    marginBottom: '10px',
  },
  tipText: {
    color: '#FFF',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    margin: 0,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid rgba(255, 48, 80, 0.2)',
    paddingTop: '10px',
  },
  status: {
    color: '#FF3050',
    fontSize: '0.6rem',
    fontFamily: "'Press Start 2P', cursive",
    opacity: 0.7,
  }
};

export default CoachsCorner;
