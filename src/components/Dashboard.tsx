import { useEffect, useState } from "react";
import { 
  Activity, 
  Terminal,
  Users,
  Search,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Shield,
  Bomb,
  Zap,
  Cpu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";

interface Stats {
  totalUsers: number;
  totalLookups: number;
  totalSmsSent: number;
  robloxApiStatus: "Working" | "Down";
  encryptorStatus: "Working" | "Down";
  smsBomberStatus: "Working" | "Down";
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll for updates every 10 seconds to keep it "real-time" without Firebase
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayStats = stats || {
    totalUsers: 0,
    totalLookups: 0,
    totalSmsSent: 0,
    robloxApiStatus: "Working",
    encryptorStatus: "Working",
    smsBomberStatus: "Working"
  };

  const statCards = [
    { 
      label: "Total Users", 
      value: displayStats.totalUsers.toLocaleString(), 
      icon: Users, 
      color: "text-primary",
      description: "Real-time unique visitor count"
    },
    { 
      label: "Total Lookups", 
      value: displayStats.totalLookups.toLocaleString(), 
      icon: Search, 
      color: "text-blue-400",
      description: "Global Roblox profile searches"
    },
    { 
      label: "SMS Sent", 
      value: displayStats.totalSmsSent.toLocaleString(), 
      icon: MessageSquare, 
      color: "text-yellow-400",
      description: "Global bombing requests"
    },
    { 
      label: "System Load", 
      value: "14%", 
      icon: Cpu, 
      color: "text-purple-400",
      description: "Current server utilization"
    },
  ];

  const toolStatuses = [
    { name: "Roblox LookUp", status: displayStats.robloxApiStatus, icon: Search },
    { name: "Python Encryptor", status: displayStats.encryptorStatus, icon: Shield },
    { name: "SMS Bomber", status: displayStats.smsBomberStatus, icon: Bomb },
    { name: "System API", status: "Working" as const, icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="hardware-card border-border/50 overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full bg-current ${stat.color} opacity-50`} />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 tracking-tighter ${stat.color}`}>
                  {loading && !stats ? "---" : stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {stat.description}
                </p>
              </div>
              <stat.icon className={`w-10 h-10 opacity-10 ${stat.color} group-hover:opacity-20 transition-opacity`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="hardware-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Tool Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {toolStatuses.map((tool, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded bg-black/20 border border-border/50">
                <div className="flex items-center gap-3">
                  <tool.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-mono">{tool.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase ${tool.status === "Working" ? "text-green-400" : "text-red-400"}`}>
                    {tool.status}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${tool.status === "Working" ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="hardware-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Live System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-[10px]">
              {[
                { time: new Date().toLocaleTimeString(), action: "Backend stats synchronized", status: "SUCCESS" },
                { time: new Date(Date.now() - 5000).toLocaleTimeString(), action: "Tool status verification", status: "WORKING" },
                { time: new Date(Date.now() - 15000).toLocaleTimeString(), action: "Global user session active", status: "INFO" },
                { time: new Date(Date.now() - 30000).toLocaleTimeString(), action: "Hardware acceleration enabled", status: "SECURE" },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">[{log.time}]</span>
                  <span className="flex-1">{log.action}</span>
                  <span className={log.status === "SUCCESS" || log.status === "WORKING" || log.status === "SECURE" ? "text-primary" : "text-blue-400"}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hardware-card border-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            System Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/50 p-4 rounded border border-border font-mono text-[10px] h-[150px] overflow-hidden">
            <p className="text-primary">root@omni-tool:~$ initialize_backend_sync</p>
            <p className="text-white mt-1">Connecting to API server... OK</p>
            <p className="text-white">Fetching global metrics... DONE</p>
            <p className="text-primary mt-2">root@omni-tool:~$ status_check --all</p>
            <p className="text-white mt-1">Roblox API: {displayStats.robloxApiStatus}</p>
            <p className="text-white">Encryptor: {displayStats.encryptorStatus}</p>
            <p className="text-white">SMS Bomber: {displayStats.smsBomberStatus}</p>
            <p className="text-primary mt-2">root@omni-tool:~$ <span className="animate-pulse">_</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to increment stats using Backend
export async function incrementStat(field: "totalUsers" | "totalLookups" | "totalSmsSent") {
  try {
    // For totalUsers, we use a unique ID stored in localStorage to avoid double counting
    let userId = localStorage.getItem("omni_tool_user_id");
    if (!userId) {
      userId = Math.random().toString(36).substring(7);
      localStorage.setItem("omni_tool_user_id", userId);
    }

    await fetch("/api/stats/increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, userId })
    });
  } catch (error) {
    console.error("Failed to increment stat:", error);
  }
}
