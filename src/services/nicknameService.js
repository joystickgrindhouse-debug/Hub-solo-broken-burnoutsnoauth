const adjectives = [
  "Swift", "Mighty", "Bold", "Fierce", "Brave", "Strong", "Quick", "Wild", 
  "Iron", "Steel", "Thunder", "Lightning", "Shadow", "Rapid", "Turbo", 
  "Power", "Ultra", "Mega", "Epic", "Elite", "Prime", "Alpha", "Omega"
];

const nouns = [
  "Tiger", "Lion", "Wolf", "Eagle", "Hawk", "Panther", "Bear", "Dragon",
  "Phoenix", "Warrior", "Champion", "Fighter", "Runner", "Racer", "Crusher",
  "Blaster", "Hunter", "Storm", "Force", "Titan", "Beast", "Gladiator"
];

export const NicknameService = {
  generate() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `${adjective}${noun}${number}`;
  },
  
  validate(nickname) {
    if (!nickname || nickname.trim().length === 0) {
      return { valid: false, error: "Nickname cannot be empty" };
    }
    if (nickname.length < 3) {
      return { valid: false, error: "Nickname must be at least 3 characters" };
    }
    if (nickname.length > 20) {
      return { valid: false, error: "Nickname must be 20 characters or less" };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
      return { valid: false, error: "Nickname can only contain letters, numbers, and underscores" };
    }
    return { valid: true };
  }
};
