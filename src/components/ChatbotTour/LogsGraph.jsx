import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

const LogsGraph = ({ data, type }) => {
  const t = useTheme();

  return (
    <div style={styles.container}>
      <h4 style={{ ...styles.title, color: t.accent }}>{type.toUpperCase()} TRENDS</h4>
      <div style={styles.graphPlaceholder}>
        <div style={{ color: '#666', fontSize: '12px' }}>Graph visualization for {type} data...</div>
        <div style={styles.barContainer}>
          {[40, 70, 50, 90, 60, 80, 55].map((h, i) => (
            <div key={i} style={{
              ...styles.bar,
              height: `${h}%`,
              background: t.accent,
              boxShadow: `0 0 5px ${t.accent}`,
            }} />
          ))}
        </div>
      </div>
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
    letterSpacing: '1px',
  },
  graphPlaceholder: {
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
  },
  barContainer: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '60%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    padding: '0 5px',
  },
  bar: {
    width: '10%',
    borderRadius: '2px 2px 0 0',
  }
};

export default LogsGraph;
