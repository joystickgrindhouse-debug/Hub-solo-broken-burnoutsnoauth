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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-sm bg-black/40 
                      border border-pink-500/40 rounded-2xl 
                      p-6 text-center shadow-[0_0_30px_rgba(255,0,80,0.5)]">

        <h1 className="text-4xl font-bold tracking-widest text-pink-400 mb-4">
          RIVALIS
        </h1>

        <div className="text-pink-300 text-xs mb-6 leading-5">
          GET HOOKED.<br />
          OUT-TRAIN.<br />
          OUT-RIVAL.
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-pink-500/40 
                       text-pink-200 px-3 py-2 rounded-md text-sm 
                       outline-none focus:border-pink-400"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-pink-500/40 
                       text-pink-200 px-3 py-2 rounded-md text-sm 
                       outline-none focus:border-pink-400"
          />

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-500 
                       text-black font-bold py-2 rounded-md transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}