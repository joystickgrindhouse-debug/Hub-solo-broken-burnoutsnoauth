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
  const [showTour, setShowTour] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const motivationalQuotes = [
    "Biological limits are meant to be shattered, Rival.",
    "Your neural link is primed. Time for a bio-metric upgrade.",
    "The mainframe is watching. Show them what a Rival is made of.",
    "Efficiency is the only currency in this sector. Earn it.",
    "Pain is just data leaving the system. Process it."
  ];

  useEffect(() => {
    const checkTour = async () => {
      // Priority 1: Check localStorage for immediate UI response
      const localTourStatus = window.localStorage.getItem('rivalis_tour_completed');
      
      // Priority 2: Check Firestore for persistent status
      let firestoreTourStatus = false;
      if (userProfile && userProfile.tourCompleted !== undefined) {
        firestoreTourStatus = userProfile.tourCompleted;
      }

      // Check if user is the specific account requested for reset
      const isResetAccount = user?.email?.toLowerCase() === 'socalturfexperts@gmail.com';

      if (!localTourStatus && !firestoreTourStatus || isResetAccount) {
        if (isResetAccount) {
          window.localStorage.removeItem('rivalis_tour_completed');
        }
        setShowTour(true);
        setMessages([{ 
          id: 'init', 
          text: "INITIALIZING NEURAL LINK... Welcome to the sector, Rival. I am your high-intelligence AI Fitness Coach. Initialization tour protocol engaged.", 
          isBot: true, 
          timestamp: new Date() 
        }]);
      } else {
        const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setMessages([{ 
          id: 'welcome', 
          text: `PROTOCOL ACTIVE. ${quote} State your objective, ${userProfile?.nickname || 'Rival'}. I am ready to optimize your performance.`, 
          isBot: true, 
          timestamp: new Date() 
        }]);
      }
    };
    
    checkTour();
  }, [userProfile, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, isBot: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (inputText.toLowerCase().includes('/tour') || inputText.toLowerCase().includes('/reboot')) {
      setTourStep(0);
      setShowTour(true);
      return;
    }

    try {
      // Create conversation if it doesn't exist
      let convId = window.localStorage.getItem('rivalis_conv_id');
      
      const sendRequest = async (cid) => {
        // Use full URL to avoid proxy issues if necessary, but /api is configured in vite
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
        
        if (!convRes.ok) {
          const errData = await convRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create conversation');
        }
        
        const convData = await convRes.json();
        convId = convData.id;
        window.localStorage.setItem('rivalis_conv_id', convId);
        response = await sendRequest(convId);
      } else {
        response = await sendRequest(convId);
        if (response.status === 404 || response.status === 500) {
          // If the conversation ID is invalid, clear and retry once
          window.localStorage.removeItem('rivalis_conv_id');
          const convRes = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `Chat with ${userProfile?.nickname || 'Rival'}` })
          });
          
          if (!convRes.ok) throw new Error('Failed to reset conversation');
          
          const convData = await convRes.json();
          convId = convData.id;
          window.localStorage.setItem('rivalis_conv_id', convId);
          response = await sendRequest(convId);
        }
      }

      if (!response || !response.ok) {
        const errText = await response.text().catch(() => 'Unknown error');
        console.error("Server responded with error:", response.status, errText);
        throw new Error(`AI connection failed: ${response.status}`);
      }

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
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullText += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId ? { ...m, text: fullText } : m
                ));
              }
            } catch (e) {
              console.warn("Error parsing SSE chunk:", e);
            }
          }
        }
      }

      // Check for escalation
      if (fullText.includes("TRANSFERRING TO HUMAN AGENT")) {
        try {
          await addDoc(collection(db, 'admin_notifications'), {
            type: 'CHAT_ESCALATION',
            userId: user.uid,
            userName: userProfile?.nickname || user.email,
            timestamp: Timestamp.now(),
            status: 'pending',
            message: `User ${userProfile?.nickname || user.email} requested assistance that the AI could not provide.`
          });
          console.log("Admin notification sent for escalation");
        } catch (error) {
          console.error("Failed to notify admins:", error);
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
        text: `My neural link is flickering, Rival. (Error: ${error.message}). Try again in a moment.`, 
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
      window.localStorage.setItem('rivalis_tour_completed', 'true');
      
      // Also update Firestore if user is logged in
      if (user) {
        const syncTourStatus = async () => {
          try {
            const { UserService } = await import('../../services/userService.js');
            await UserService.updateUserProfile(user.uid, { tourCompleted: true });
          } catch (error) {
            console.error("Failed to sync tour status to Firestore:", error);
          }
        };
        syncTourStatus();
      }
      
      if (onTourComplete) onTourComplete();
    }
  };

  const exportConversation = async () => {
    const convId = window.localStorage.getItem('rivalis_conv_id');
    if (convId) {
      try {
        window.open(`/api/conversations/${convId}/export`, '_blank');
      } catch (error) {
        console.error("Export failed:", error);
        // Fallback to text export if API fails
        const text = messages.map(m => `${m.isBot ? 'COACH' : 'RIVAL'}: ${m.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rivalis_Plan_Fallback_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      alert("No active protocol detected. Link not established.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={styles.statusDot}></div>
          <span style={styles.headerTitle}>RIVALIS CHATBOT AI</span>
        </div>
        <button 
          onClick={exportConversation}
          style={{
            background: 'transparent',
            border: '1px solid #FF0000',
            color: '#FF0000',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: "'Press Start 2P', cursive",
            textShadow: '0 0 5px #FF0000'
          }}
        >
          EXPORT PLAN
        </button>
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
        <div style={styles.tourOverlay} onClick={(e) => e.stopPropagation()}>
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
    padding: '10px 15px',
    background: '#111',
    borderBottom: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#FF0000',
    boxShadow: '0 0 10px #FF0000',
  },
  headerTitle: {
    color: '#FF0000',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textShadow: '0 0 5px #FF0000',
    fontFamily: "'Press Start 2P', cursive",
  },
  chatArea: {
    flex: 1,
    padding: '15px 10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    WebkitOverflowScrolling: 'touch',
  },
  inputArea: {
    padding: '10px',
    background: '#111',
    borderTop: '1px solid #333',
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    background: '#000',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 15px',
    color: '#FFF',
    outline: 'none',
    fontSize: '16px', // Prevents iOS zoom
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