import { createContext, useContext, useEffect, useState } from "react";

const VoiceContext = createContext();

export function VoiceProvider({ children }) {

  const [enabled, setEnabled] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {

    function handleTap(e) {

      if (e.clientX < 80 && e.clientY < 80) {

        setTapCount(prev => prev + 1);

        setTimeout(() => setTapCount(0), 2000);
      }
    }

    window.addEventListener("click", handleTap);

    return () => window.removeEventListener("click", handleTap);

  }, []);

  useEffect(() => {

    if (tapCount >= 5) {
      setEnabled(true);
    }

  }, [tapCount]);

  return (
    <VoiceContext.Provider value={{ enabled }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  return useContext(VoiceContext);
}
