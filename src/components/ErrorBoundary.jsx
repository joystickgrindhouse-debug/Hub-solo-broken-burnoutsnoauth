import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // In production, we could send this to a service like Sentry or a custom backend endpoint
    console.error("Production Error Caught:", error, errorInfo);
    
    // Log to our own backend
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
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#ff3050',
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
              background: '#ff3050',
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
