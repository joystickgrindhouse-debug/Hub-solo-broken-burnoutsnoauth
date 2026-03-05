import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, authReady } from "../firebase";
import { useNavigate } from "react-router-dom";

// ✅ FIX 4: Added centered wrapper with max-width so the form
// doesn't stretch full-width when BackgroundShell doesn't constrain it.

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await authReady;
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // Outer centering wrapper
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,0,80,0.2)",
          borderRadius: "16px",
          padding: "40px 32px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#ff2a7a",
            marginBottom: "16px",
          }}
        >
          RIVALIS
        </h1>

        <div
          style={{
            color: "#ff6a9c",
            fontSize: "12px",
            marginBottom: "24px",
            lineHeight: "1.8",
            letterSpacing: "0.05em",
          }}
        >
          GET HOOKED.<br />
          OUT-TRAIN.<br />
          OUT-RIVAL.
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "12px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid rgba(255,0,80,0.4)",
              background: "black",
              color: "white",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "12px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid rgba(255,0,80,0.4)",
              background: "black",
              color: "white",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ color: "#ff4444", fontSize: "12px", marginBottom: "8px" }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              background: "#ff2a7a",
              color: "black",
              fontWeight: "bold",
              padding: "10px",
              borderRadius: "6px",
              marginTop: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              letterSpacing: "0.05em",
              boxSizing: "border-box",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
