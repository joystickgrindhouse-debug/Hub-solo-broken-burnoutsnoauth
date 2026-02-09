import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

const MOOD_SCORES = { 'Great': 100, 'Good': 75, 'Okay': 50, 'Low': 25, 'Struggling': 10 };
const PHYSICAL_SCORES = { 'Strong': 100, 'Energized': 85, 'Normal': 60, 'Tired': 40, 'Sore': 20, 'Injured': 5 };

const LogsGraph = ({ data, type }) => {
  const t = useTheme();

  const scores = type === 'mood' ? MOOD_SCORES : PHYSICAL_SCORES;
  const hasRealData = data && data.length > 0;

  const entries = hasRealData
    ? data.map(d => ({
        label: d.date ? d.date.slice(5) : '',
        value: scores[type === 'mood' ? d.mood : d.physical] || 50,
        raw: type === 'mood' ? d.mood : d.physical,
      }))
    : [];

  const maxVal = 100;

  return (
    <div style={styles.container}>
      <h4 style={{ ...styles.title, color: t.accent }}>{type.toUpperCase()} TRENDS</h4>
      {!hasRealData ? (
        <div style={styles.empty}>
          <span style={{ color: '#666', fontSize: '11px' }}>No data yet. Complete daily check-ins to see trends.</span>
        </div>
      ) : (
        <div style={styles.graphArea}>
          <div style={styles.yAxis}>
            <span style={styles.yLabel}>High</span>
            <span style={styles.yLabel}>Low</span>
          </div>
          <div style={styles.barContainer}>
            {entries.map((entry, i) => (
              <div key={i} style={styles.barCol}>
                <div style={styles.tooltip}>{entry.raw}</div>
                <div style={{
                  ...styles.bar,
                  height: `${(entry.value / maxVal) * 100}%`,
                  background: entry.value >= 75 ? '#00ff44' : entry.value >= 50 ? t.accent : entry.value >= 25 ? '#ff8800' : '#ff3344',
                  boxShadow: `0 0 6px ${entry.value >= 75 ? '#00ff44' : entry.value >= 50 ? t.accent : '#ff3344'}`,
                }} />
                <span style={styles.xLabel}>{entry.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
    fontFamily: "'Press Start 2P', cursive",
  },
  empty: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    borderRadius: '4px',
  },
  graphArea: {
    display: 'flex',
    height: '120px',
    background: '#000',
    borderRadius: '4px',
    padding: '8px',
    gap: '4px',
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: '16px',
  },
  yLabel: {
    color: '#555',
    fontSize: '8px',
    fontFamily: "'Press Start 2P', cursive",
  },
  barContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: '2px',
    paddingBottom: '0',
  },
  barCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  tooltip: {
    color: '#aaa',
    fontSize: '7px',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    textAlign: 'center',
  },
  bar: {
    width: '70%',
    minWidth: '6px',
    maxWidth: '20px',
    borderRadius: '2px 2px 0 0',
    transition: 'height 0.4s ease',
  },
  xLabel: {
    color: '#555',
    fontSize: '7px',
    marginTop: '3px',
    fontFamily: "'Press Start 2P', cursive",
  }
};

export default LogsGraph;
