import { useState } from "react";
import { Search, Loader2, User, ShieldCheck, Globe, Calendar, Users, Award, Layers, Zap, Mail, MapPin, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";

interface RobloxRecord {
  account_info: string;
  query: string;
  uid: string;
  nickname: string;
  display_name: string;
  profile_url: string;
  avatar: string;
  join_date: string;
  friends: string;
  followers: string;
  following: string;
  badges: number;
  groups: number;
  owned_groups: number;
  collectibles: number;
  rap: string;
  premium: string;
  email_verified: string;
  last_location: string;
  banned: string;
}

export function RobloxLookup() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<RobloxRecord | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!username) return;
    
    setIsLoading(true);
    setRecord(null);
    setError(null);

    try {
      const response = await fetch(`/api/roblox/lookup/${encodeURIComponent(username)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }
      const data = await response.json();
      setRecord(data);
    } catch (err: any) {
      console.error("Lookup error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const outputLines = record ? [
    `USERNAME:PASSWORD: ${record.account_info}`,
    `QUERY: ${record.query}`,
    `UID: ${record.uid}`,
    `Nickname: ${record.nickname}`,
    `Display Name: ${record.display_name}`,
    `Profile URL: ${record.profile_url}`,
    `Avatar: ${record.avatar}`,
    `Join Date: ${record.join_date}`,
    `Friends: ${record.friends}`,
    `Followers: ${record.followers}`,
    `Following: ${record.following}`,
    `Badges: ${record.badges}`,
    `Groups: ${record.groups}`,
    `Owned Groups: ${record.owned_groups}`,
    `Collectibles: ${record.collectibles}`,
    `RAP: ${record.rap}`,
    `Premium: ${record.premium}`,
    `Email Verified: ${record.email_verified}`,
    `Last Location: ${record.last_location}`,
    `Banned: ${record.banned}`,
  ] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="hardware-card hardware-glow border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Search className="w-5 h-5" />
            Roblox Look Up
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter a Roblox username to retrieve detailed account information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="username" className="text-xs uppercase tracking-widest text-muted-foreground">Enter Username:</Label>
              <Input
                id="username"
                placeholder="e.g. Builderman"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background border-border focus-visible:ring-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
            </div>
            <Button 
              onClick={handleLookup} 
              disabled={isLoading || !username}
              className="sm:self-end bg-primary text-black hover:bg-primary/90 font-bold px-8"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "LOOKUP"}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded border border-red-500/50 bg-red-500/10 text-red-400 text-sm font-mono">
              ERROR: {error}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {record && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Profile Overview */}
            <Card className="hardware-card border-border md:col-span-1">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full border-2 border-primary/50 p-1 overflow-hidden">
                    <img 
                      src={record.avatar} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {record.premium === "Yes" && (
                    <Badge className="absolute -bottom-2 right-0 bg-yellow-500 text-black border-none">PREMIUM</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{record.display_name}</h3>
                <p className="text-sm text-muted-foreground font-mono">@{record.nickname}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="border-primary/30 text-primary/80">UID: {record.uid}</Badge>
                  <Badge variant="outline" className={record.banned === "Yes" ? "border-red-500 text-red-500" : "border-green-500 text-green-500"}>
                    {record.banned === "Yes" ? "BANNED" : "ACTIVE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Data */}
            <Card className="hardware-card border-border md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Raw Output</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full rounded-md border border-border bg-black/50 p-4">
                  <div className="font-mono text-sm space-y-1">
                    {outputLines.map((line, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-muted-foreground select-none">[{i.toString().padStart(2, '0')}]</span>
                        <span className={line.startsWith('USERNAME:PASSWORD') ? "text-red-400" : "text-primary/80"}>
                          {line}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">Friends</p>
                    <p className="font-bold text-white">{record.friends}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">Followers</p>
                    <p className="font-bold text-white">{record.followers}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">Groups</p>
                    <p className="font-bold text-white">{record.groups}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">Badges</p>
                    <p className="font-bold text-white">{record.badges}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">Last Location</p>
                    <p className="font-bold text-primary truncate" title={record.last_location}>{record.last_location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">Owned Groups</p>
                    <p className="font-bold text-white">{record.owned_groups}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">Premium</p>
                    <p className="font-bold text-white">{record.premium}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground">RAP</p>
                    <p className="font-bold text-primary">{record.rap}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
