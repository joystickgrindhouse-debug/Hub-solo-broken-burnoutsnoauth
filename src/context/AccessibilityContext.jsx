<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
=======
import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeVoiceControl } from '../logic/voiceControl';
import TTS from '../services/tts.js';
>>>>>>> 5669225 (ui: add reference preview overlay; lightweight solo exercise engine; dashboard hero + collapsible AI chatbot)

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
<<<<<<< HEAD
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      // Try to find Karen (en-AU)
      const karenVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("karen") &&
          voice.lang.toLowerCase().includes("en-au")
      );

      if (karenVoice) {
        voiceRef.current = karenVoice;
        console.log("Karen EN-AU voice loaded.");
      } else {
        console.log("Karen not found. Using default voice.");
        voiceRef.current = voices.find((v) =>
          v.lang.toLowerCase().includes("en")
        );
      }
    };

    loadVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text, force = false) => {
    if (!ttsEnabled && !force) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  const enableAccessibility = () => {
    setTtsEnabled(true);
    setVoiceEnabled(true);

    speak("Rivalis mode engaged. Let’s get to work.", true);
=======
    // initialize global voice control listeners (tap detection & recognition)
    try { initializeVoiceControl(); } catch (e) { /* ignore */ }
  }, []);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => !prev);
>>>>>>> 5669225 (ui: add reference preview overlay; lightweight solo exercise engine; dashboard hero + collapsible AI chatbot)
  };

  const value = {
    // keep backwards-compatible names and provide the shape VoiceNavigator expects
    voiceEnabled,
    toggleVoice,
    isEnabled: voiceEnabled,
    speak: (text, opts) => {
      try {
        if (TTS && typeof TTS.speak === 'function') return TTS.speak(text, opts);
      } catch (e) { console.debug('TTS speak failed', e); }
      return Promise.resolve();
    },
  };

  return (
<<<<<<< HEAD
    <AccessibilityContext.Provider
      value={{
        ttsEnabled,
        voiceEnabled,
        enableAccessibility,
        speak
      }}
    >
=======
    <AccessibilityContext.Provider value={value}>
>>>>>>> 5669225 (ui: add reference preview overlay; lightweight solo exercise engine; dashboard hero + collapsible AI chatbot)
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);