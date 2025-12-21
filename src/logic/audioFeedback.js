// Audio feedback system using Web Speech API
let lastFeedbackTime = 0;
const FEEDBACK_THROTTLE = 3000; // Min time between same feedback (ms)
const feedbackCache = new Set();

export function speakFeedback(text) {
  if (!('speechSynthesis' in window)) {
    console.log('Web Speech API not supported');
    return;
  }
  
  const now = Date.now();
  
  // Throttle repeated feedback
  if (feedbackCache.has(text) && now - lastFeedbackTime < FEEDBACK_THROTTLE) {
    return;
  }
  
  // Cancel previous speech
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8; // Slower speech for clarity
  utterance.pitch = 1;
  utterance.volume = 1;
  
  utterance.onend = () => {
    lastFeedbackTime = now;
  };
  
  speechSynthesis.speak(utterance);
  feedbackCache.clear();
  feedbackCache.add(text);
}

export function speakNumber(num) {
  const text = num === 1 ? `${num} rep` : `${num} reps`;
  speakFeedback(text);
}

export const COACHING_MESSAGES = {
  chest_too_high: "Lower your chest",
  right_hip_high: "Lower your right hip",
  left_hip_high: "Lower your left hip",
  hips_uneven: "Keep your hips level",
  elbow_bent_too_much: "Keep your elbows straighter",
  elbow_not_bent_enough: "Bend your elbows more",
  good_form: "Great form!",
  rep_complete: "Rep complete",
  set_complete: "Set complete",
  push_harder: "Push harder",
  slow_down: "Control the movement"
};

export function getCoachingMessage(issue) {
  if (!issue) return null;
  
  switch (issue.type) {
    case 'uneven_hips':
      return issue.side === 'left' ? COACHING_MESSAGES.left_hip_high : COACHING_MESSAGES.right_hip_high;
    case 'uneven_shoulders':
      return COACHING_MESSAGES.push_harder;
    case 'chest_too_high':
      return COACHING_MESSAGES.chest_too_high;
    case 'elbow_angle':
      return issue.angle < 45 ? COACHING_MESSAGES.elbow_not_bent_enough : COACHING_MESSAGES.elbow_bent_too_much;
    default:
      return null;
  }
}
