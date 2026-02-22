import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeVoiceControl } from "../logic/voiceControl";
import TTS from "../services/tts.js";

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    // Initialize global voice control listeners safely
    try {
      initializeVoiceControl();
    } catch (e) {
      console.debug("Voice control init failed", e);
    }
  }, []);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => !prev);
  };

  const speak = async (text, opts = {}) => {
    try {
      if (TTS && typeof TTS.speak === "function") {
        return await TTS.speak(text, opts);
      }
    } catch (e) {
      console.debug("TTS speak failed", e);
    }
    return Promise.resolve();
  };

  const value = {
    voiceEnabled,
    toggleVoice,
    isEnabled: voiceEnabled, // backwards compatibility
    speak,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);