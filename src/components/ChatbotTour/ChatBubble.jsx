import React, { useState, useEffect } from 'react';

const TypingIndicator = () => (
  <div style={styles.typingContainer}>
    <div style={styles.typingDot} className="typing-dot-1" />
    <div style={{ ...styles.typingDot, animationDelay: '0.15s' }} className="typing-dot-2" />
    <div style={{ ...styles.typingDot, animationDelay: '0.3s' }} className="typing-dot-3" />
    <style>{`
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

const ChatBubble = ({ message, isBot, isTyping = false, animate = true }) => {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }
  }, [animate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      alignItems: 'flex-end',
      gap: '8px',
      marginBottom: '6px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {isBot && (
        <div style={styles.botAvatar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2">
            <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z"/>
            <rect x="4" y="8" width="16" height="12" rx="2"/>
            <circle cx="9" cy="14" r="1.5" fill="#FF0000"/>
            <circle cx="15" cy="14" r="1.5" fill="#FF0000"/>
            <path d="M9 18h6" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: isTyping ? '12px 20px' : '10px 14px',
        borderRadius: isBot ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
        background: isBot
          ? 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)'
          : 'linear-gradient(135deg, #e60000 0%, #cc0000 100%)',
        color: '#FFF',
        border: isBot ? '1px solid rgba(255,0,0,0.3)' : 'none',
        boxShadow: isBot
          ? '0 2px 8px rgba(255,0,0,0.1)'
          : '0 2px 8px rgba(255,0,0,0.25)',
        position: 'relative',
      }}>
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <div style={{
            fontSize: '13px',
            lineHeight: '1.5',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}>{message}</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  botAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255,0,0,0.1)',
    border: '1px solid rgba(255,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typingContainer: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    height: '20px',
    padding: '0 4px',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#FF0000',
    animation: 'typingBounce 0.8s ease-in-out infinite',
  },
};

export default ChatBubble;
