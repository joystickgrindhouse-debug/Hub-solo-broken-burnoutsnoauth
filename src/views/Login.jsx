import React, { useState } from "react";
import { auth } from "../firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { generateAvatarForUser } from "../avatarService.js";

const styles = {
  rivalisTitle: {
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
    fontWeight: "normal",
    color: "#ff3050",
    textTransform: "uppercase",
    letterSpacing: "2px",
    margin: "0 0 1.5rem 0",
    textShadow: `
      0 0 10px rgba(255, 48, 80, 0.8),
      0 0 20px rgba(255, 48, 80, 0.6),
      0 0 30px rgba(255, 48, 80, 0.4),
      0 0 40px rgba(255, 48, 80, 0.2)
    `,
    animation: "slamIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, pulse 2s ease-in-out 0.8s infinite",
    transformOrigin: "center center",
    lineHeight: "1.5",
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
    overflow: "visible",
    textAlign: "center"
  },
  tagline: {
    fontSize: "0.75rem",
    color: "#ff3050",
    margin: "0 0 1.5rem 0",
    opacity: 0,
    animation: "fadeIn 0.5s ease-in 0.6s forwards",
    fontFamily: "'Press Start 2P', cursive",
    lineHeight: "1.8",
    whiteSpace: "pre-line",
    textAlign: "center"
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await generateAvatarForUser(userCredential.user);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="hero-background">
      <div className="overlay-card">
        <h1 style={styles.rivalisTitle}>RIVALIS</h1>
        <p style={styles.tagline}>GET HOOKED.{'\n'}OUT-TRAIN.{'\n'}OUT-RIVAL.</p>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
        </form>
        {error && <p style={{color:"#ff3050", fontWeight: "bold"}}>{error}</p>}
        <p style={{marginTop:"1rem", color: "#ff3050"}}>
          <button onClick={() => setIsSignup(!isSignup)} style={{color: "#ff3050"}}>
            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </button>
        </p>
      </div>
      <style>{`
        @keyframes slamIn {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          70% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            text-shadow: 
              0 0 10px rgba(255, 48, 80, 0.8),
              0 0 20px rgba(255, 48, 80, 0.6),
              0 0 30px rgba(255, 48, 80, 0.4),
              0 0 40px rgba(255, 48, 80, 0.2);
            transform: scale(1);
          }
          50% {
            text-shadow: 
              0 0 20px rgba(255, 48, 80, 1),
              0 0 30px rgba(255, 48, 80, 0.8),
              0 0 40px rgba(255, 48, 80, 0.6),
              0 0 50px rgba(255, 48, 80, 0.4),
              0 0 60px rgba(255, 48, 80, 0.2);
            transform: scale(1.05);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
