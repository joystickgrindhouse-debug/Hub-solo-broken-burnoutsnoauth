import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import ChatBubble from './ChatBubble.jsx';
import TourStep from './TourStep.jsx';
import LogsGraph from './LogsGraph.jsx';
import NutritionalCoach from './NutritionalCoach.jsx';

const ChatbotTour = ({ user, userProfile, onTourComplete, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(true);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (initialMessage) {
      setMessages([{ id: 'init', text: initialMessage, isBot: true, timestamp: new Date() }]);
    } else {
      setMessages([{ id: 'welcome', text: "Welcome back, Rival! Ready for your tour or a quick update?", isBot: true, timestamp: new Date() }]);
    }
  }, [initialMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, isBot: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulated Bot Responses based on keywords
    setTimeout(() => {
      let botResponse = "I'm listening! Tell me more about your progress.";
      const input = inputText.toLowerCase();

      if (input.includes('yes') || input.includes('sure') || input.includes('ok')) {
        if (showTour) {
          botResponse = "Great! Let's move to the next step of the tour.";
          nextTourStep();
        } else {
          botResponse = "Awesome! How can I help you today?";
        }
      } else if (input.includes('plan')) {
        botResponse = "Nutritional guidance active. Check the coach panel for your macro breakdown. I've also generated a suggested workout plan for you!";
      } else if (input.includes('support')) {
        botResponse = "Support will respond shortly. In the meantime, keep pushing!";
      } else if (input.includes('weight') || input.includes('log')) {
        botResponse = "Daily log updated! I've visualized your latest trends in the graphs above.";
      } else if (input.includes('nickname') || input.includes('bio')) {
        botResponse = "Profile updated! Looking sharp, Rival.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, isBot: true, timestamp: new Date() }]);
    }, 1000);
  };

  const nextTourStep = () => {
    if (tourStep < 6) {
      setTourStep(prev => prev + 1);
    } else {
      setShowTour(false);
      if (onTourComplete) onTourComplete();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.statusDot}></div>
        <span style={styles.headerTitle}>RIVALIS CHATBOT AI</span>
      </div>

      <div style={styles.chatArea}>
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
        ))}
        
        {/* Special widgets based on bot responses */}
        {messages.some(m => m.text.includes('visualized')) && (
          <LogsGraph type="weight" />
        )}
        {messages.some(m => m.text.includes('Nutritional')) && (
          <NutritionalCoach />
        )}
        
        <div ref={chatEndRef} />
      </div>

      {showTour && (
        <div style={styles.tourOverlay}>
          <TourStep 
            step={tourStep} 
            onNext={nextTourStep} 
            onSkip={() => setShowTour(false)} 
          />
        </div>
      )}

      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me anything..."
          style={styles.input}
        />
        <button type="submit" style={styles.sendButton}>➤</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#000',
    border: '1px solid #333',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    padding: '15px',
    background: '#111',
    borderBottom: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#FF0000',
    boxShadow: '0 0 10px #FF0000',
  },
  headerTitle: {
    color: '#FF0000',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    textShadow: '0 0 5px #FF0000',
  },
  chatArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  inputArea: {
    padding: '15px',
    background: '#111',
    borderTop: '1px solid #333',
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    background: '#000',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '10px 15px',
    color: '#FFF',
    outline: 'none',
  },
  sendButton: {
    background: '#FF0000',
    border: 'none',
    borderRadius: '8px',
    width: '40px',
    color: '#FFF',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    padding: '20px',
  }
};

export default ChatbotTour;