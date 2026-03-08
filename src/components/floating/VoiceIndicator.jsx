import { useVoice } from "../../context/VoiceContext";

export default function VoiceIndicator() {

  const { enabled } = useVoice();

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        background: "#111",
        border: "1px solid #333",
        padding: "10px 14px",
        borderRadius: "10px",
        fontSize: "12px",
        color: "#fff",
        zIndex: 3000
      }}
    >
      🎤 Voice Control Active
    </div>
  );
}
