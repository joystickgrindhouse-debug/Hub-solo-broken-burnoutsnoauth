import React, { useState, useEffect, useRef } from "react";
import { ChatService } from "../services/chatService.js";
import CustomEmojiPicker from "../components/CustomEmojiPicker.jsx";

export default function GlobalChat({ user, userProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = ChatService.subscribeToGlobalMessages((fetchedMessages) => {
      setMessages(fetchedMessages);
    }, 50);

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await ChatService.sendGlobalMessage({
      userId: user.uid,
      nickname: userProfile?.nickname || user.displayName || user.email,
      avatarURL: userProfile?.avatarURL || user.photoURL || "",
      text: input.trim()
    });

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onEmojiSelect = (emoji) => {
    setInput(input + emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="hero-background">
      <div style={{ 
        width: "95%", 
        maxWidth: "800px",
        minHeight: "80vh",
        display: "flex", 
        flexDirection: "column",
        background: "#000000",
        border: "2px solid #ff3050",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 0 30px rgba(255, 48, 80, 0.5), inset 0 0 20px rgba(255, 48, 80, 0.05)"
      }}>
        <h2 style={{ 
          color: "#ff3050",
          textShadow: "0 0 15px rgba(255, 48, 80, 0.8)",
          marginBottom: "1rem",
          textTransform: "uppercase",
          letterSpacing: "2px"
        }}>
          🔥 Global Chat
        </h2>
        <div style={{ 
          flex: 1, 
          overflowY: "auto", 
          marginBottom: "1rem", 
          border: "1px solid rgba(255, 48, 80, 0.3)", 
          padding: "0.5rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.5rem", 
          background: "rgba(0, 0, 0, 0.5)",
          borderRadius: "8px",
          boxShadow: "inset 0 0 15px rgba(255, 48, 80, 0.1)"
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(255, 48, 80, 0.5)", padding: "2rem" }}>
              No messages yet. Be the first to send a message!
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} style={{ 
                display: "flex", 
                gap: "0.5rem", 
                alignItems: "flex-start", 
                padding: "0.75rem", 
                background: "rgba(255, 48, 80, 0.05)", 
                borderRadius: "8px",
                border: "1px solid rgba(255, 48, 80, 0.2)",
                transition: "all 0.2s"
              }}>
                {m.avatarURL && (
                  <img 
                    src={m.avatarURL} 
                    alt={m.nickname} 
                    style={{ 
                      width: "32px", 
                      height: "32px", 
                      borderRadius: "50%", 
                      background: "#fff",
                      border: "2px solid #ff3050"
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div>
                    <strong style={{ color: "#ff3050", textShadow: "0 0 8px rgba(255, 48, 80, 0.6)" }}>
                      {m.nickname}:
                    </strong>{" "}
                    <span style={{ color: "#fff" }}>{m.text}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <textarea 
            style={{ 
              width: "100%",
              padding: "0.5rem", 
              height: "40px",
              resize: "none",
              fontSize: "14px",
              borderRadius: "8px",
              border: "2px solid #ff3050",
              boxSizing: "border-box",
              background: "#000000",
              color: "#fff",
              boxShadow: "0 0 15px rgba(255, 48, 80, 0.3), inset 0 0 10px rgba(255, 48, 80, 0.05)",
              lineHeight: "1.4"
            }} 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                padding: "0.75rem 1rem",
                fontSize: "18px",
                background: "#000000",
                border: "2px solid #ff3050",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#ff3050",
                fontWeight: "bold",
                boxShadow: "0 0 15px rgba(255, 48, 80, 0.5)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 48, 80, 0.2)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 48, 80, 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#000000";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 48, 80, 0.5)";
              }}
            >
              🎮
            </button>
            <button 
              onClick={sendMessage}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                fontSize: "16px",
                background: "#ff3050",
                border: "2px solid #ff3050",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#fff",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                boxShadow: "0 0 20px rgba(255, 48, 80, 0.6)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 48, 80, 0.9)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 48, 80, 0.6)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Send 💥
            </button>
          </div>
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              style={{
                position: "absolute",
                bottom: "100%",
                left: "0",
                marginBottom: "10px",
                zIndex: 1000
              }}
            >
              <CustomEmojiPicker 
                onEmojiSelect={onEmojiSelect} 
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
