import React, { useState, useEffect } from "react";
import { MatchmakingService } from "../services/matchmakingService";
import LoadingScreen from "../components/LoadingScreen";

export default function LiveMode({ user, userProfile }) {
  const [match, setMatch] = useState(null);
  const [searching, setSearching] = useState(false);
  const [role, setRole] = useState(null);

  const startMatchmaking = async (category) => {
    setSearching(true);
    const result = await MatchmakingService.joinQueue(user.uid, userProfile?.nickname || user.email, category);
    setRole(result.role);
    MatchmakingService.listenToMatch(result.matchId, (data) => {
      setMatch(data);
      setSearching(false);
    });
  };

  if (searching) return <LoadingScreen message="Finding Rival..." />;

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white bg-black p-4 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-4 neon-text">LIVE MATCHUP</h1>
        <p className="mb-6 text-center text-zinc-400">Select your workout focus for this battle.</p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
          {['Arms', 'Legs', 'Core', 'Full Body'].map((cat) => (
            <button
              key={cat}
              onClick={() => startMatchmaking(cat.toLowerCase().replace(' ', ''))}
              className="bg-zinc-900 hover:bg-red-600 border-2 border-red-900 text-white font-bold py-4 rounded-lg transition-all"
            >
              {cat}
            </button>
          ))}
        </div>

        <button 
          onClick={() => startMatchmaking('full')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-lg border-2 border-white shadow-[0_0_20px_rgba(255,0,0,0.4)] animate-pulse"
        >
          QUICK START (FULL BODY)
        </button>
      </div>
    );
  }

  const handleSessionEnd = async (stats) => {
    if (!match) return;
    await MatchmakingService.submitTurn(match.id || match.matchId, user.uid, stats, match);
  };

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "SESSION_STATS") {
        await handleSessionEnd(event.data.stats);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [match]);

  return (
    <div className="text-white p-4 h-full flex flex-col items-center overflow-y-auto">
      <h2 className="text-2xl mb-4 font-bold neon-text">{match.player1Name} vs {match.player2Name}</h2>
      <div className="bg-zinc-900 p-4 rounded-xl border-2 border-red-600 w-full max-w-4xl">
        <div className="flex justify-between mb-4 px-4 font-bold text-red-500">
          <span>{match.player1Name}: {match.deck1Count}/52</span>
          <span>{match.player2Name}: {match.deck2Count}/52</span>
        </div>
        
        {match.wildcardMessage && (
          <div className="bg-red-900/50 border border-red-500 p-3 mb-4 rounded animate-bounce text-center">
            <span className="text-white font-bold">⚠️ {match.wildcardMessage}</span>
          </div>
        )}
        
        {match.status === "completed" ? (
          <div className="text-center py-10">
            <h3 className="text-3xl text-yellow-400 mb-4">MATCH COMPLETE!</h3>
            <button onClick={() => window.location.reload()} className="bg-red-600 px-6 py-2 rounded">BACK TO ARENA</button>
          </div>
        ) : match.currentTurn === user.uid ? (
          <div className="flex flex-col items-center">
            <h3 className="text-xl text-green-400 mb-4">YOUR TURN!</h3>
            <div style={{ width: "100%", height: "500px", position: "relative" }}>
               <iframe
                src={`/solo.html?mode=live&category=${match.category || 'full'}&matchId=${match.id || match.matchId}&effect=${match.pendingEffect?.id || ''}`}
                title="Live Turn"
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: "10px" }}
                allow="camera; microphone"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl text-yellow-400 mb-4 animate-pulse">
              {match.currentTurn === "BOT_ID" ? "BOT IS ANALYZING FORM..." : "RIVAL IS PERFORMING..."}
            </h3>
            <p className="text-zinc-400">Stay hydrated, your turn is next.</p>
          </div>
        )}
      </div>
    </div>
  );
}
