import AICoach from "./AICoach";
import VoiceIndicator from "./VoiceIndicator";
import ChatbotTour from "../ChatbotTour/ChatbotTour";

export default function FloatingLayer() {
  return (
    <>
      <AICoach />
      <VoiceIndicator />
      <ChatbotTour />
    </>
  );
}
