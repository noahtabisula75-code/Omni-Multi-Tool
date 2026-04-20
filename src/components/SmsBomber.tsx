import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bomb, 
  Phone, 
  Play, 
  Square, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Zap,
  ShieldAlert,
  BarChart3
} from "lucide-react";
import axios from "axios";
import { incrementStat } from "@/components/Dashboard";
import { motion, AnimatePresence } from "motion/react";

interface LogEntry {
  id: string;
  time: string;
  service: string;
  status: "success" | "error";
  message: string;
}

const SERVICES = [
  "S5.com",
  "Xpress PH",
  "Abenson",
  "Excellente Lending",
  "FortunePay",
  "WeMove",
  "LBC",
  "Pickup Coffee",
  "HoneyLoan",
  "Komo"
];

export function SmsBomber() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [requestCount, setRequestCount] = useState("10");
  const [isBombing, setIsBombing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    startTime: 0,
    elapsed: 0
  });
  
  const stopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let interval: any;
    if (isBombing) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          elapsed: Math.floor((Date.now() - prev.startTime) / 1000)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBombing]);

  const addLog = (service: string, status: "success" | "error", message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString(),
      service,
      status,
      message
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      success: status === "success" ? prev.success + 1 : prev.success,
      failed: status === "error" ? prev.failed + 1 : prev.failed
    }));
  };

  const validatePhone = (num: string) => {
    return /^(09\d{9}|9\d{9})$/.test(num);
  };

  const startBombing = async () => {
    if (!validatePhone(phoneNumber)) {
      addLog("System", "error", "Invalid phone number format. Use 09XXXXXXXXX or 9XXXXXXXXX.");
      return;
    }

    const countInput = parseInt(requestCount);
    const count = Math.min(countInput, 10);
    if (isNaN(count) || count <= 0) {
      addLog("System", "error", "Invalid request count.");
      return;
    }

    setIsBombing(true);
    stopRef.current = false;
    setStats({
      total: 0,
      success: 0,
      failed: 0,
      startTime: Date.now(),
      elapsed: 0
    });
    setLogs([]);
    addLog("System", "success", `Initiating mission on ${phoneNumber} for ${count} requests...`);

    const workers = 5; // Concurrent requests
    let completed = 0;

    const runWorker = async () => {
      while (completed < count && !stopRef.current) {
        const currentTask = completed++;
        if (currentTask >= count) break;

        const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
        
        try {
          const response = await axios.post("/api/sms/bomb", {
            phoneNumber,
            service
          });
          
          if (response.data.success) {
            addLog(service, "success", `OTP request sent successfully (Status: ${response.data.status})`);
            // Increment global SMS stat
            await incrementStat("totalSmsSent");
          } else {
            addLog(service, "error", `Failed to send OTP: ${response.data.error}`);
          }
        } catch (error: any) {
          addLog(service, "error", `Connection error: ${error.message}`);
        }

        // Random delay between requests to mimic human behavior/avoid detection
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      }
    };

    const workerPromises = Array(workers).fill(null).map(() => runWorker());
    await Promise.all(workerPromises);

    setIsBombing(false);
    addLog("System", "success", "Mission complete.");
  };

  const stopBombing = () => {
    stopRef.current = true;
    setIsBombing(false);
    addLog("System", "error", "Mission aborted by user.");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Card */}
        <Card className="hardware-card border-primary/20 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Bomb className="w-5 h-5" />
              BOMBER CONFIG
            </CardTitle>
            <CardDescription>Professional SMS Testing Tool</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Target Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="phone"
                  placeholder="09XXXXXXXXX" 
                  className="pl-10 bg-black/40 border-primary/20 focus:border-primary"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isBombing}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Format: 09XXXXXXXXX (PH Numbers Only)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Request Count (Max 10)</Label>
              <Input 
                id="count"
                type="number"
                placeholder="10" 
                max={10}
                className="bg-black/40 border-primary/20 focus:border-primary"
                value={requestCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val > 10) setRequestCount("10");
                  else setRequestCount(e.target.value);
                }}
                disabled={isBombing}
              />
            </div>

            <div className="pt-4 space-y-2">
              {!isBombing ? (
                <Button 
                  className="w-full bg-primary text-black hover:bg-primary/90 font-bold"
                  onClick={startBombing}
                >
                  <Play className="w-4 h-4 mr-2" />
                  LAUNCH MISSION
                </Button>
              ) : (
                <Button 
                  variant="destructive"
                  className="w-full font-bold animate-pulse"
                  onClick={stopBombing}
                >
                  <Square className="w-4 h-4 mr-2" />
                  ABORT MISSION
                </Button>
              )}
            </div>

            <div className="p-4 rounded border border-yellow-500/20 bg-yellow-500/5 space-y-2">
              <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold">
                <ShieldAlert className="w-3 h-3" />
                WARNING
              </div>
              <p className="text-[10px] text-yellow-500/70 leading-tight">
                This tool is for educational and testing purposes only. Unauthorized use on numbers you do not own is strictly prohibited.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Logs Card */}
        <Card className="hardware-card border-border lg:col-span-2 flex flex-col h-[600px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Mission Analytics
              </CardTitle>
            </div>
            {isBombing && (
              <Badge variant="outline" className="border-primary text-primary animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ACTIVE
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden pt-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded bg-black/40 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Success</p>
                <p className="text-xl font-bold text-primary">{stats.success}</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Failed</p>
                <p className="text-xl font-bold text-red-400">{stats.failed}</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-xl font-bold text-blue-400">{stats.total}</p>
              </div>
              <div className="p-3 rounded bg-black/40 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Elapsed</p>
                <p className="text-xl font-bold text-yellow-400">{stats.elapsed}s</p>
              </div>
            </div>

            {/* Console Output */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Activity className="w-3 h-3" />
                Live Console Output
              </div>
              <div 
                ref={scrollRef}
                className="flex-1 bg-black/60 rounded border border-border p-4 font-mono text-[11px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-primary/20"
              >
                {logs.length === 0 && (
                  <p className="text-muted-foreground italic">Waiting for mission launch...</p>
                )}
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 border-b border-white/5 pb-1"
                    >
                      <span className="text-muted-foreground shrink-0">[{log.time}]</span>
                      <span className="text-blue-400 shrink-0 w-24 truncate">[{log.service}]</span>
                      <span className={log.status === "success" ? "text-primary" : "text-red-400"}>
                        {log.status === "success" ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Card */}
      <Card className="hardware-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Integrated Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <Badge key={s} variant="secondary" className="bg-white/5 text-[10px] uppercase tracking-tighter">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
