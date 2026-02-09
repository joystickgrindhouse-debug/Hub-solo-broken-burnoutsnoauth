import React, { useState, useEffect, useRef } from "react";
import { ChatService } from "../services/chatService.js";
import CustomEmojiPicker from "../components/CustomEmojiPicker.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function GlobalChat({ user, userProfile, hideNavbar, roomId }) {
  const t = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = roomId 
      ? ChatService.subscribeToRoomMessages(roomId, (fetchedMessages) => {
          setMessages(fetchedMessages);
        }, 50)
      : ChatService.subscribeToGlobalMessages((fetchedMessages) => {
          setMessages(fetchedMessages);
        }, 50);

    return () => unsubscribe();
  }, [user, roomId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageData = {
      userId: user.uid,
      nickname: userProfile?.nickname || user.displayName || user.email,
      avatarURL: userProfile?.avatarURL || user.photoURL || "",
      text: input.trim()
    };

    if (roomId) {
      await ChatService.sendRoomMessage({ ...messageData, roomId });
    } else {
      await ChatService.sendGlobalMessage(messageData);
    }

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

  const containerStyle = hideNavbar ? {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#000000",
    padding: "1rem",
    boxSizing: "border-box"
  } : {
    width: "95%",
    maxWidth: "800px",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    background: "#000000",
    border: `2px solid ${t.accent}`,
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: `0 0 30px ${t.shadowMd}, inset 0 0 20px ${t.shadowXxs}`
  };

  const content = (
    <div style={containerStyle}>
      {!hideNavbar && (
        <h2 style={{ 
          color: t.accent,
          textShadow: `0 0 15px ${t.shadow}`,
          marginBottom: "1rem",
          textTransform: "uppercase",
          letterSpacing: "2px"
        }}>
          🔥 Global Chat
        </h2>
      )}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        marginBottom: "1rem", 
        border: `1px solid ${t.shadowSm}`, 
        padding: "0.5rem", 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.5rem", 
        background: "rgba(0, 0, 0, 0.5)",
        borderRadius: "8px",
        boxShadow: `inset 0 0 15px ${t.shadowXs}`
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: t.shadowMd, padding: "2rem" }}>
            No messages yet. Be the first to send a message!
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ 
              display: "flex", 
              gap: "0.5rem", 
              alignItems: "flex-start", 
              padding: "0.75rem", 
              background: t.shadowXxs, 
              borderRadius: "8px",
              border: `1px solid ${t.shadowXs}`,
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
                    border: `2px solid ${t.accent}`
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div>
                  <strong style={{ color: t.accent, textShadow: `0 0 8px ${t.shadowMd}` }}>
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
            border: `2px solid ${t.accent}`,
            boxSizing: "border-box",
            background: "#000000",
            color: "#fff",
            boxShadow: `0 0 15px ${t.shadowSm}, inset 0 0 10px ${t.shadowXxs}`,
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
              border: `2px solid ${t.accent}`,
              borderRadius: "8px",
              cursor: "pointer",
              color: t.accent,
              fontWeight: "bold",
              boxShadow: `0 0 15px ${t.shadowMd}`,
              transition: "all 0.2s"
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
              background: t.accent,
              border: `2px solid ${t.accent}`,
              borderRadius: "8px",
              cursor: "pointer",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              boxShadow: `0 0 20px ${t.shadowMd}`,
              transition: "all 0.2s"
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
  );

  return hideNavbar ? content : (
    <div className="hero-background">
      {content}
    </div>
  );
}
