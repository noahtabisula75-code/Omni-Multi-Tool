import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds loading
    const interval = 20;
    const step = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 font-mono"
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded bg-primary/10 border border-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
            <Terminal className="text-primary w-6 h-6 animate-pulse" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tighter text-primary italic">OMNI MULTI TOOL SERVICE</h1>
            <p className="text-[10px] text-primary/50 uppercase tracking-[0.3em] font-bold">Initializing System...</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold text-primary/70">
            <span>Loading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
