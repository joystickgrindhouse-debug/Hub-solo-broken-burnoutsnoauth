import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

const NutritionalCoach = () => {
  const t = useTheme();

  const plans = [
    { type: 'Cutting', calories: '1800', macros: '40P/40C/20F' },
    { type: 'Bulking', calories: '3200', macros: '30P/50C/20F' },
    { type: 'Maintenance', calories: '2400', macros: '35P/40C/25F' }
  ];

  return (
    <div style={styles.container}>
      <h4 style={{ ...styles.title, color: t.accent }}>NUTRITIONAL COACH</h4>
      <div style={styles.planList}>
        {plans.map((plan, i) => (
          <div key={i} style={styles.planCard}>
            <div style={styles.planType}>{plan.type}</div>
            <div style={styles.planDetails}>{plan.calories} kcal • {plan.macros}</div>
          </div>
        ))}
      </div>
      <button style={{ ...styles.button, color: t.accent, border: `1px solid ${t.accent}` }}>Get Meal Suggestions</button>
    </div>
  );
};

const styles = {
  container: {
    background: '#111',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #333',
    margin: '10px 0',
  },
  title: {
    fontSize: '12px',
    marginBottom: '10px',
  },
  planList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '10px',
  },
  planCard: {
    background: '#1A1A1A',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #222',
  },
  planType: {
    color: '#FFF',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  planDetails: {
    color: '#888',
    fontSize: '12px',
  },
  button: {
    width: '100%',
    background: 'transparent',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  }
};

export default NutritionalCoach;
