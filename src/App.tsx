import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard, incrementStat } from "@/components/Dashboard";
import { RobloxLookup } from "@/components/RobloxLookup";
import { PythonEncryptor } from "@/components/PythonEncryptor";
import { PythonDecoder } from "@/components/PythonDecoder";
import { SmsBomber } from "@/components/SmsBomber";
import { OfficialChannels } from "@/components/OfficialChannels";
import { TelegramPopup } from "@/components/TelegramPopup";
import { LoadingScreen } from "@/components/LoadingScreen";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTool, setActiveTool] = useState("dashboard");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Track unique user session on backend
    incrementStat("totalUsers");
  }, []);

  const renderContent = () => {
    if (isInitializing) return null;
    
    switch (activeTool) {
      case "dashboard":
        return <Dashboard />;
      case "official-channels":
        return <OfficialChannels />;
      case "roblox-lookup":
        return <RobloxLookup />;
      case "python-encryptor":
        return <PythonEncryptor />;
      case "python-decoder":
        return <PythonDecoder />;
      case "sms-bomber":
        return <SmsBomber />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-black">
      <AnimatePresence>
        {isInitializing && (
          <LoadingScreen onComplete={() => setIsInitializing(false)} />
        )}
      </AnimatePresence>

      {!isInitializing && (
        <>
          <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
          
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                    {activeTool.replace("-", " ")}
                  </h1>
                  <p className="text-muted-foreground mt-1 font-mono text-sm">
                    OMNI_MULTI_TOOL_SERVICE_V1.0.4 // SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  SYSTEM_READY
                </div>
              </header>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTool}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </>
      )}
      <TelegramPopup />
    </div>
  );
}
