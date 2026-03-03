import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, authReady } from "../firebase";
import { useNavigate } from "react-router-dom";

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
    <div style={{ width: "100%" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#ff2a7a",
          marginBottom: "16px"
        }}
      >
        RIVALIS
      </h1>

      <div
        style={{
          color: "#ff6a9c",
          fontSize: "12px",
          marginBottom: "24px"
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
            color: "white"
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
            color: "white"
          }}
        />

        {error && (
          <p style={{ color: "red", fontSize: "12px" }}>{error}</p>
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
            marginTop: "10px"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
