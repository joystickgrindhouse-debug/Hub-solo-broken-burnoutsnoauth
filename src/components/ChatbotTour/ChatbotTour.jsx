import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  Timestamp,
} from 'firebase/firestore';
import ChatBubble from './ChatBubble.jsx';
import TourStep, { TOUR_STEPS } from './TourStep.jsx';
import LogsGraph from './LogsGraph.jsx';
import NutritionalCoach from './NutritionalCoach.jsx';

const INTAKE_START_STEP = 3;

const TOUR_QUESTIONS = [
  { field: 'gender', question: "What is your gender? This helps calibrate your training baseline.", options: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'] },
  { field: 'age', question: "What is your age?", type: 'number' },
  { field: 'height', question: "What is your height? (e.g. 5'10\" or 178cm)", type: 'text' },
  { field: 'weight', question: "What is your current weight? (e.g. 175lbs or 80kg)", type: 'text' },
  { field: 'goals', question: "What is your primary fitness goal?", options: ['Mass Gain', 'Fat Loss', 'Endurance', 'General Health'] },
  { field: 'interests', question: "What are your other interests?", options: ['Gaming', 'Tech/AI', 'Outdoor Activities', 'Strategy Games'] },
  { field: 'reason', question: "What brought you to Rivalis?", options: ['The Competition', 'Self Improvement', 'Data-Driven Fitness', 'Tactical Training'] }
];

const MOTIVATIONAL_QUOTES = [
  "Biological limits are meant to be shattered, Rival.",
  "Your neural link is primed. Time for a biometric upgrade.",
  "The mainframe is watching. Show them what a Rival is made of.",
  "Efficiency is the only currency in this sector. Earn it.",
  "Pain is just data leaving the system. Process it."
];

const ChatbotTour = ({ user, userProfile, onTourComplete, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const isPro = userProfile?.subscriptionStatus === 'active';

  const addBotMessage = useCallback((text, delay = 0) => {
    if (delay > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: `bot-${Date.now()}-${Math.random()}`, 
          text, 
          isBot: true, 
          timestamp: new Date() 
        }]);
        setIsLoading(false);
      }, delay);
    } else {
      setMessages(prev => [...prev, { 
        id: `bot-${Date.now()}-${Math.random()}`, 
        text, 
        isBot: true, 
        timestamp: new Date() 
      }]);
    }
  }, []);

  useEffect(() => {
    const localTourDone = window.localStorage.getItem('rivalis_tour_completed');
    const firestoreTourDone = userProfile?.tourCompleted;

    if (!localTourDone && !firestoreTourDone) {
      setShowTour(true);
      addBotMessage("INITIALIZING NEURAL LINK... Welcome to the sector, Rival. I am your AI Fitness Coach. Let me show you around the hub.");
    } else {
      const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      addBotMessage(`${quote} Ready when you are, ${userProfile?.nickname || 'Rival'}.`);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const [profileData, setProfileData] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    goals: '',
    interests: '',
    reason: ''
  });

  const isInIntake = showTour && tourStep >= INTAKE_START_STEP && tourStep < INTAKE_START_STEP + TOUR_QUESTIONS.length;
  const intakeIndex = tourStep - INTAKE_START_STEP;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = { id: `user-${Date.now()}`, text: inputText, isBot: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');

    if (isInIntake) {
      const currentQ = TOUR_QUESTIONS[intakeIndex];
      const newProfile = { ...profileData, [currentQ.field]: currentInput };
      setProfileData(newProfile);

      if (intakeIndex < TOUR_QUESTIONS.length - 1) {
        const nextQ = TOUR_QUESTIONS[intakeIndex + 1];
        const questionText = nextQ.question + (nextQ.options ? `\n\nOptions: ${nextQ.options.join(' / ')}` : '');
        addBotMessage(questionText, 500);
        setTourStep(prev => prev + 1);
      } else {
        addBotMessage("Profile data recorded. Syncing your biometrics... You're all set. Define your personal mission in your BIO to complete initialization.", 600);
        
        if (user) {
          try {
            const { UserService } = await import('../../services/userService.js');
            await UserService.updateUserProfile(user.uid, { ...newProfile });
          } catch (err) {
            console.error("Failed to sync biometrics:", err);
          }
        }
        setTourStep(prev => prev + 1);
      }
      return;
    }

    if (currentInput.toLowerCase().includes('/tour') || currentInput.toLowerCase().includes('/reboot')) {
      setTourStep(0);
      setShowTour(true);
      addBotMessage("Reinitializing tour protocol...", 400);
      return;
    }

    setIsLoading(true);

    try {
      let convId = window.localStorage.getItem('rivalis_conv_id');
      
      const userContext = isPro ? [
        userProfile?.goals && `Goal: ${userProfile.goals}`,
        userProfile?.weight && `Weight: ${userProfile.weight}`,
        userProfile?.height && `Height: ${userProfile.height}`,
        userProfile?.age && `Age: ${userProfile.age}`,
      ].filter(Boolean).join(', ') : '';

      const sendRequest = async (cid) => {
        return await fetch(`/api/conversations/${cid}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: currentInput, isPro, userContext })
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
      const assistantMsgId = `ai-${Date.now()}`;
      let fullText = "";

      setIsLoading(false);
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
              // skip malformed chunks
            }
          }
        }
      }

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
        } catch (error) {
          console.error("Failed to notify admins:", error);
        }
      }

    } catch (error) {
      console.error("AI Error:", error);
      setIsLoading(false);
      
      try {
        await addDoc(collection(db, 'admin_notifications'), {
          type: 'CHATBOT_ERROR',
          userId: user.uid,
          userName: userProfile?.nickname || user.email,
          error: error.message,
          timestamp: Timestamp.now(),
          status: 'pending',
          message: `Internal error in Rivalis Coach for user ${userProfile?.nickname || user.email}.`
        });
      } catch (notifyErr) {
        console.error("Failed to notify admin of error:", notifyErr);
      }

      addBotMessage("Connection interrupted. Our support team has been notified. Please try again in a moment, or describe your issue and we'll get back to you.");
    }
  };

  const nextTourStep = () => {
    setIsMinimized(true);
    const totalSteps = TOUR_STEPS.length;

    if (tourStep < totalSteps - 1) {
      setTourStep(prev => prev + 1);
      
      if (tourStep + 1 === INTAKE_START_STEP) {
        const firstQ = TOUR_QUESTIONS[0];
        addBotMessage(firstQ.question + `\n\nOptions: ${firstQ.options.join(' / ')}`, 400);
      }
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setShowTour(false);
    window.localStorage.setItem('rivalis_tour_completed', 'true');
    
    if (user) {
      (async () => {
        try {
          const { UserService } = await import('../../services/userService.js');
          await UserService.updateUserProfile(user.uid, { tourCompleted: true });
        } catch (error) {
          console.error("Failed to sync tour status:", error);
        }
      })();
    }
    
    if (onTourComplete) onTourComplete();
    window.location.href = '/';
  };

  const skipTour = () => {
    setShowTour(false);
    window.localStorage.setItem('rivalis_tour_completed', 'true');
    
    if (user) {
      (async () => {
        try {
          const { UserService } = await import('../../services/userService.js');
          await UserService.updateUserProfile(user.uid, { tourCompleted: true });
        } catch (error) {
          console.error("Failed to sync tour status:", error);
        }
      })();
    }

    if (onTourComplete) onTourComplete();
    addBotMessage(`Tour skipped. No worries — you can restart it anytime by typing /tour. Ready when you are, ${userProfile?.nickname || 'Rival'}.`, 300);
  };

  const exportConversation = async () => {
    const convId = window.localStorage.getItem('rivalis_conv_id');
    if (convId) {
      try {
        window.open(`/api/conversations/${convId}/export`, '_blank');
      } catch (error) {
        console.error("Export failed:", error);
        const text = messages.map(m => `${m.isBot ? 'COACH' : 'RIVAL'}: ${m.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rivalis_Plan_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-8px) translateX(-50%); }
        }
        .chatbot-scrollbar::-webkit-scrollbar { width: 4px; }
        .chatbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chatbot-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,0,0,0.3); border-radius: 4px; }
      `}</style>

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={styles.statusDot} />
          <span style={styles.headerTitle}>RIVALIS COACH</span>
          {isPro && (
            <span style={styles.proBadge}>PRO</span>
          )}
        </div>
        <button onClick={exportConversation} style={styles.exportBtn}>
          EXPORT
        </button>
      </div>

      {showTour && !isMinimized && (
        <div style={styles.tourOverlay} onClick={(e) => e.stopPropagation()}>
          <TourStep 
            step={tourStep} 
            onNext={nextTourStep} 
            onSkip={skipTour} 
          />
        </div>
      )}

      {showTour && isMinimized && (
        <div style={styles.resumeTab} onClick={() => setIsMinimized(false)}>
          <div style={styles.resumePulse} />
          <span style={styles.resumeText}>RESUME TOUR</span>
        </div>
      )}

      {(!showTour || isMinimized) && (
        <>
          <div style={styles.chatArea} className="chatbot-scrollbar">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
            ))}
            
            {messages.some(m => m.text.includes('visualized')) && (
              <LogsGraph type="weight" />
            )}
            {messages.some(m => m.text.includes('Nutritional')) && (
              <NutritionalCoach />
            )}

            {isLoading && (
              <ChatBubble isBot={true} isTyping={true} message="" animate={false} />
            )}
            
            <div ref={chatEndRef} />
          </div>

          {!showTour && isPro && (
            <div style={styles.proActions}>
              {[
                { label: '🥗 Meal Plan', prompt: 'Create a personalized meal plan for my goals' },
                { label: '💪 Workout', prompt: 'Build me a custom workout program' },
                { label: '🎯 Goals', prompt: 'Help me set and track my fitness goals' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(action.prompt);
                    inputRef.current?.focus();
                  }}
                  style={styles.proActionBtn}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          {!showTour && !isPro && (
            <div style={styles.upgradeBar}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                Unlock meal plans, workouts & goals
              </span>
              <a href="/subscription" style={styles.upgradeLink}>GO PRO</a>
            </div>
          )}
          <form onSubmit={handleSendMessage} style={styles.inputArea} data-chatbot-form>
            <input 
              ref={inputRef}
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isLoading ? "Coach is thinking..." : (isPro ? "Ask your personal trainer..." : "Ask me anything...")}
              style={{
                ...styles.input,
                ...(isLoading ? { opacity: 0.5, pointerEvents: 'none' } : {})
              }}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              style={{
                ...styles.sendButton,
                ...(isLoading || !inputText.trim() ? { opacity: 0.4, cursor: 'default' } : {})
              }}
              disabled={isLoading || !inputText.trim()}
            >
              ➤
            </button>
          </form>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#000',
    border: '1px solid rgba(51,51,51,0.6)',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  header: {
    padding: '10px 15px',
    background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
    borderBottom: '1px solid rgba(255,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#00ff44',
    boxShadow: '0 0 8px #00ff44',
    animation: 'pulse 2s infinite',
  },
  headerTitle: {
    color: '#FF0000',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textShadow: '0 0 6px rgba(255,0,0,0.4)',
    fontFamily: "'Press Start 2P', cursive",
  },
  proBadge: {
    background: 'linear-gradient(135deg, #ff3050, #ff6080)',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '8px',
    fontWeight: 'bold',
    fontFamily: "'Press Start 2P', cursive",
    letterSpacing: '1px',
  },
  exportBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,0,0,0.3)',
    color: 'rgba(255,0,0,0.7)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '9px',
    cursor: 'pointer',
    fontFamily: "'Press Start 2P', cursive",
    transition: 'all 0.2s ease',
  },
  chatArea: {
    flex: 1,
    padding: '12px 10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    WebkitOverflowScrolling: 'touch',
  },
  inputArea: {
    padding: '10px',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
    borderTop: '1px solid rgba(255,0,0,0.1)',
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    background: '#000',
    border: '1px solid rgba(51,51,51,0.6)',
    borderRadius: '10px',
    padding: '12px 15px',
    color: '#FFF',
    outline: 'none',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
  },
  sendButton: {
    background: 'linear-gradient(135deg, #FF0000, #cc0000)',
    border: 'none',
    borderRadius: '10px',
    width: '44px',
    color: '#FFF',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(255,0,0,0.2)',
  },
  tourOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    padding: '20px',
  },
  resumeTab: {
    background: 'linear-gradient(135deg, #FF0000, #cc0000)',
    padding: '10px 20px',
    borderRadius: '20px 20px 0 0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 -4px 20px rgba(255,0,0,0.3)',
    pointerEvents: 'auto',
    position: 'absolute',
    bottom: 0,
    right: '20px',
    animation: 'slideUp 0.3s ease-out',
  },
  resumeText: {
    color: '#FFF',
    fontSize: '9px',
    fontFamily: "'Press Start 2P', cursive",
    letterSpacing: '0.5px',
  },
  resumePulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#FFF',
    animation: 'pulse 1.5s infinite',
  },
  proActions: {
    display: 'flex',
    gap: '6px',
    padding: '6px 10px',
    background: '#0a0a0a',
    borderTop: '1px solid rgba(255,0,0,0.1)',
    overflowX: 'auto',
  },
  proActionBtn: {
    background: 'rgba(255,48,80,0.08)',
    border: '1px solid rgba(255,48,80,0.25)',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  upgradeBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '6px 10px',
    background: 'rgba(255,48,80,0.04)',
    borderTop: '1px solid rgba(255,48,80,0.1)',
  },
  upgradeLink: {
    color: '#ff3050',
    fontSize: '10px',
    fontWeight: 'bold',
    fontFamily: "'Press Start 2P', cursive",
    textDecoration: 'none',
    textShadow: '0 0 5px rgba(255,48,80,0.5)',
    flexShrink: 0,
  },
};

export default ChatbotTour;
