import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Trophy, User, Mail, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { user, isLoading, login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    // This local auth is now deprecated in favor of Hub Login
    toast({ title: "Local Auth Deprecated", description: "Please use the Hub login button." });
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-display">LOADING SYSTEM...</div>;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-center items-center text-center">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-7xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-4 tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]"
        >
          RIVALIS
          <span className="block text-primary text-5xl md:text-7xl mt-2 drop-shadow-[0_0_30px_rgba(255,0,85,0.8)]">BOXING</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl font-body text-gray-400 mb-12 max-w-2xl"
        >
          Use your webcam to fight in real-time. Block, dodge, and punch your way to victory in the cyber-arena.
        </motion.p>

        <div className="flex flex-col md:flex-row gap-6">
          {user ? (
            <Button 
              variant="neon" 
              size="lg" 
              onClick={() => setLocation("/dashboard")}
              className="text-xl px-12 py-8"
            >
              <Play className="mr-3 w-6 h-6" /> ENTER ARENA
            </Button>
          ) : (
            <Button 
              variant="neon" 
              size="lg"
              className="text-xl px-12 py-8"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User className="mr-3 w-6 h-6" /> LOGIN TO FIGHT
            </Button>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full">
          <FeatureCard 
            icon={<Trophy className="w-8 h-8 text-primary" />}
            title="RANKED MATCHES"
            desc="Climb the global leaderboards with every victory."
          />
          <FeatureCard 
            icon={<User className="w-8 h-8 text-primary" />}
            title="REAL MOTION"
            desc="Powered by MediaPipe. Your body is the controller."
          />
          <FeatureCard 
            icon={<Play className="w-8 h-8 text-primary" />}
            title="INSTANT ACTION"
            desc="No download required. Play directly in your browser."
          />
        </div>
      </div>

      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0a0a0a] border border-primary/30 p-8 rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(255,0,85,0.2)]"
            >
              <h2 className="text-3xl font-display mb-2 text-white">
                {isRegister ? "CREATE ACCOUNT" : "SYSTEM LOGIN"}
              </h2>
              <p className="text-gray-400 mb-8 font-body">
                {isRegister ? "Join the Rivalis cyber-arena." : "Welcome back, combatant."}
              </p>

              <form onSubmit={handleAuth} className="space-y-6">
                <Button 
                  type="button" 
                  onClick={() => login()}
                  className="w-full py-8 text-lg font-display tracking-widest bg-primary hover:bg-primary/90 flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-2xl">CONTINUE TO HUB</span>
                  <span className="text-[10px] opacity-70 tracking-[0.2em]">CROSS-DOMAIN SYNC</span>
                </Button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-gray-500">OR</span></div>
                </div>

                <div className="space-y-2 opacity-50 pointer-events-none">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <Input 
                      disabled
                      type="email"
                      placeholder="Email Address"
                      className="pl-11 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-gray-400 hover:text-primary transition-colors font-body"
                >
                  {isRegister ? "Already have access? Login" : "No account? Register here"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-display mb-2 text-white">{title}</h3>
      <p className="text-gray-400 font-body">{desc}</p>
    </div>
  );
}
