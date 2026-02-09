import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

const CoachsCorner = () => {
  const t = useTheme();
  const [tip, setTip] = useState('');
  const [isVisible, setIsVisible] = useState(false);

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
    const lastShown = localStorage.getItem('coach_tip_timestamp');
    const now = Date.now();
    if (!lastShown || now - parseInt(lastShown) > 4 * 60 * 60 * 1000) {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setTip(randomTip);
      setIsVisible(true);
      localStorage.setItem('coach_tip_timestamp', now.toString());
    }
  }, []);

  if (!isVisible) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20000,
      backdropFilter: 'blur(5px)',
    },
    container: {
      background: '#0a0a0a',
      border: `2px solid ${t.accent}`,
      borderRadius: '16px',
      padding: '25px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: `0 0 30px ${t.shadowSm}`,
      position: 'relative',
      animation: 'popup-glow 2s infinite alternate',
    },
    closeBtn: {
      position: 'absolute',
      top: '10px',
      right: '15px',
      background: 'none',
      border: 'none',
      color: t.accent,
      fontSize: '24px',
      cursor: 'pointer',
      fontFamily: 'serif',
    },
    title: {
      color: t.accent,
      fontFamily: "'Press Start 2P', cursive",
      fontSize: '0.8rem',
      margin: '10px 0 20px 0',
      textAlign: 'center',
      textShadow: `0 0 8px ${t.accent}`,
    },
    content: {
      background: t.shadowXs,
      borderLeft: `4px solid ${t.accent}`,
      padding: '15px',
      marginBottom: '20px',
    },
    tipText: {
      color: '#FFF',
      fontSize: '1rem',
      lineHeight: '1.5',
      margin: 0,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    footer: {
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: '15px',
    },
    status: {
      color: t.accent,
      fontSize: '0.6rem',
      fontFamily: "'Press Start 2P', cursive",
      opacity: 0.7,
    },
    actionBtn: {
      width: '100%',
      background: t.accent,
      color: '#FFF',
      border: 'none',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: "'Press Start 2P', cursive",
      fontSize: '0.7rem',
      cursor: 'pointer',
      boxShadow: `0 0 10px ${t.shadowSm}`,
    }
  };

  return (
    <div style={styles.overlay} onClick={() => setIsVisible(false)}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={() => setIsVisible(false)}>×</button>
        <h3 style={styles.title}>COACH'S CORNER</h3>
        <div style={styles.content}>
          <p style={styles.tipText}>{tip}</p>
        </div>
        <div style={styles.footer}>
          <span style={styles.status}>AI STATUS: OPTIMIZING</span>
        </div>
        <button 
          style={styles.actionBtn} 
          onClick={() => setIsVisible(false)}
        >
          ACKNOWLEDGED
        </button>
      </div>
      <style>{`
        @keyframes popup-glow {
          from { box-shadow: 0 0 20px ${t.shadowXs}; }
          to { box-shadow: 0 0 40px ${t.shadowMd}; }
        }
      `}</style>
    </div>
  );
};

export default CoachsCorner;
