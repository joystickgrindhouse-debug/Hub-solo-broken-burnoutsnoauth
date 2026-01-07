import React from 'react';

const ChatBubble = ({ message, isBot }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      marginBottom: '10px',
    }}>
      <div style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: '16px',
        background: isBot ? '#1A1A1A' : '#FF0000',
        color: '#FFF',
        border: isBot ? '1px solid #FF0000' : 'none',
        boxShadow: isBot ? '0 0 10px rgba(255, 0, 0, 0.2)' : '0 0 10px rgba(255, 0, 0, 0.4)',
        position: 'relative',
      }}>
        <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{message}</div>
      </div>
    </div>
  );
};

export default ChatBubble;