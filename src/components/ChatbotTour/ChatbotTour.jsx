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

    try {
      // Create conversation if it doesn't exist
      let convId = window.localStorage.getItem('rivalis_conv_id');
      
      const sendRequest = async (cid) => {
        return await fetch(`/api/conversations/${cid}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: inputText })
        });
      };

      let response;
      if (!convId) {
        const convRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `Chat with ${userProfile?.nickname || 'Rival'}` })
        });
        const convData = await convRes.json();
        convId = convData.id;
        window.localStorage.setItem('rivalis_conv_id', convId);
        response = await sendRequest(convId);
      } else {
        response = await sendRequest(convId);
        if (response.status === 404 || response.status === 500) {
          // If the conversation ID is invalid (e.g. from a previous failed run), clear and retry once
          window.localStorage.removeItem('rivalis_conv_id');
          const convRes = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `Chat with ${userProfile?.nickname || 'Rival'}` })
          });
          const convData = await convRes.json();
          convId = convData.id;
          window.localStorage.setItem('rivalis_conv_id', convId);
          response = await sendRequest(convId);
        }
      }

      if (!response || !response.ok) throw new Error('AI connection failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsgId = Date.now() + 1;
      let fullText = "";

      // Add empty assistant message to be filled
      setMessages(prev => [...prev, { id: assistantMsgId, text: "", isBot: true, timestamp: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullText += data.content;
              setMessages(prev => prev.map(m => 
                m.id === assistantMsgId ? { ...m, text: fullText } : m
              ));
            }
          }
        }
      }

      // Handle tour progress via AI response analysis if needed
      if (showTour && (fullText.toLowerCase().includes('next') || fullText.toLowerCase().includes('continue'))) {
        nextTourStep();
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 2, 
        text: "My neural link is flickering, Rival. Try again in a moment.", 
        isBot: true, 
        timestamp: new Date() 
      }]);
    }
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