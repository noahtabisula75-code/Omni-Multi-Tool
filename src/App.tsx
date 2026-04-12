import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RobloxLookup } from "@/components/RobloxLookup";
import { PythonEncryptor } from "@/components/PythonEncryptor";
import { SmsBomber } from "@/components/SmsBomber";
import { OfficialChannels } from "@/components/OfficialChannels";
import { TelegramPopup } from "@/components/TelegramPopup";
import { 
  Cpu,
  Globe,
  Lock,
  Zap,
  Activity,
  Terminal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTool, setActiveTool] = useState("dashboard");

  const renderContent = () => {
    switch (activeTool) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "System Status", value: "ONLINE", icon: Cpu, color: "text-primary" },
                { label: "Active Nodes", value: "1,242", icon: Globe, color: "text-blue-400" },
                { label: "Security Level", value: "MAXIMUM", icon: Lock, color: "text-red-400" },
                { label: "Power Usage", value: "84%", icon: Zap, color: "text-yellow-400" },
              ].map((stat, i) => (
                <Card key={i} className="hardware-card border-border/50">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 opacity-20 ${stat.color}`} />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hardware-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 font-mono text-xs">
                    {[
                      { time: "14:22:01", action: "Roblox Lookup performed on 'Builderman'", status: "SUCCESS" },
                      { time: "14:15:42", action: "System firewall updated", status: "INFO" },
                      { time: "13:58:12", action: "Unauthorized access attempt blocked", status: "WARN" },
                      { time: "13:45:00", action: "Database synchronization complete", status: "SUCCESS" },
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4 border-b border-border/30 pb-2">
                        <span className="text-muted-foreground">[{log.time}]</span>
                        <span className="flex-1">{log.action}</span>
                        <span className={log.status === "SUCCESS" ? "text-primary" : log.status === "WARN" ? "text-red-400" : "text-blue-400"}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hardware-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    System Console
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/50 p-4 rounded border border-border font-mono text-xs h-[180px] overflow-hidden">
                    <p className="text-primary">root@omni-tool:~$ initialize_system</p>
                    <p className="text-white mt-1">Checking dependencies... OK</p>
                    <p className="text-white">Loading modules... OK</p>
                    <p className="text-white">Establishing secure tunnel... OK</p>
                    <p className="text-primary mt-2">root@omni-tool:~$ status_check</p>
                    <p className="text-white mt-1">All systems operational.</p>
                    <p className="text-primary mt-2">root@omni-tool:~$ <span className="animate-pulse">_</span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "official-channels":
        return <OfficialChannels />;
      case "roblox-lookup":
        return <RobloxLookup />;
      case "python-encryptor":
        return <PythonEncryptor />;
      case "sms-bomber":
        return <SmsBomber />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-black">
      <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
      
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
                {activeTool.replace("-", " ")}
              </h1>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                OMNI_TOOL_V1.0.4 // SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
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
      <TelegramPopup />
    </div>
  );
}
