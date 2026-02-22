import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
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
  };

  return (
    <AccessibilityContext.Provider
      value={{
        ttsEnabled,
        voiceEnabled,
        enableAccessibility,
        speak
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);