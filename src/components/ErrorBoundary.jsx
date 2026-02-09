import React from 'react';
import ThemeContext from '../context/ThemeContext.jsx';

class ErrorBoundary extends React.Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Production Error Caught:", error, errorInfo);
    
    fetch('/api/logs/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.toString(),
        stack: errorInfo.componentStack,
        url: window.location.href,
        type: 'error'
      })
    }).catch(err => console.error("Failed to send error to log server", err));
  }

  render() {
    const t = this.context;
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: t.accent,
          fontFamily: "'Press Start 2P', cursive",
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1>SYSTEM CRITICAL ERROR</h1>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#fff' }}>
            The arena has encountered a fatal anomaly.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '1rem 2rem',
              background: t.accent,
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Press Start 2P', cursive"
            }}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
