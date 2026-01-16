import { useAuth } from "@/hooks/use-auth";
import { useMatches } from "@/hooks/use-matches";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCalibration } from "@/hooks/use-calibration";
import { Loader2, AlertCircle, Play, Swords, History, User as UserIcon } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: calibration, isLoading: loadingCal } = useCalibration();
  const { data: matches, isLoading: loadingMatches } = useMatches();

  console.log("Current user in Dashboard:", user);

  if (loadingCal || loadingMatches) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  // If no calibration, prompt for it
  const needsCalibration = !calibration;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-primary/50 overflow-hidden bg-white/5 shadow-[0_0_15px_rgba(255,0,85,0.3)] flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Avatar failed to load, falling back to icon");
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('p-2');
                  }}
                />
              ) : (
                <UserIcon className="w-8 h-8 text-primary/50" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-display text-primary leading-none">DASHBOARD</h1>
              <p className="text-gray-400 font-body mt-1 uppercase tracking-widest text-xs">OPERATOR: {user?.username || "UNKNOWN"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => logout()} className="font-display tracking-tighter hover:bg-primary/20 hover:text-primary transition-all">SIGNOUT</Button>
        </header>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Fight Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-primary/30 p-8 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Swords className="w-48 h-48 text-primary" />
            </div>
            <h2 className="text-3xl font-display mb-4">QUICK MATCH</h2>
            <p className="text-gray-400 mb-8 max-w-sm">
              Enter the cyber-ring and face off against the AI Boss. Test your skills and stamina.
            </p>
            {needsCalibration ? (
               <div className="flex flex-col gap-4">
                 <div className="flex items-center text-yellow-500 bg-yellow-500/10 p-4 rounded border border-yellow-500/20">
                   <AlertCircle className="w-5 h-5 mr-2" />
                   <span>System Calibration Required</span>
                 </div>
                 <Button onClick={() => setLocation("/calibration")} variant="default" className="w-full md:w-auto">
                   CALIBRATE NOW
                 </Button>
               </div>
            ) : (
               <Button onClick={() => setLocation("/arena")} variant="neon" size="lg" className="w-full md:w-auto text-xl py-6">
                 <Play className="w-5 h-5 mr-2" /> START FIGHT
               </Button>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-gray-900/50 border border-white/10 p-8 rounded-xl">
             <h2 className="text-3xl font-display mb-6 flex items-center">
               <History className="mr-3 text-gray-500" /> HISTORY
             </h2>
             <div className="space-y-4">
               {matches?.length === 0 && <p className="text-gray-500">No matches recorded yet.</p>}
               {matches?.slice(0, 5).map((match: any) => (
                 <div key={match.id} className="flex justify-between items-center bg-white/5 p-4 rounded hover:bg-white/10 transition-colors">
                    <div>
                      <div className="font-bold text-lg">{match.result === 'WIN' ? 'VICTORY' : 'DEFEAT'}</div>
                      <div className="text-xs text-gray-400">vs {match.opponentName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-display">{match.score} PTS</div>
                      <div className="text-xs text-gray-400">{new Date(match.createdAt).toLocaleDateString()}</div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
