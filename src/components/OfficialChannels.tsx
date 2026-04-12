import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ExternalLink, ShieldCheck, Zap, FileText } from "lucide-react";
import { motion } from "motion/react";

export function OfficialChannels() {
  const channels = [
    {
      id: 1,
      name: "CHANNEL 1",
      link: "https://t.me/txtfilegenerator",
      description: "FREE ACCOUNTS AND TXT AND TOOLS ARE IN HERE TG CHANNEL",
      icon: FileText,
      color: "text-primary",
      borderColor: "border-primary/20",
      bgColor: "bg-primary/5",
      buttonVariant: "default" as const,
    },
    {
      id: 2,
      name: "CHANNEL 2",
      link: "https://t.me/+Xc898Vj7MYA4YWVl",
      description: "EXCLUSIVE ACCESS: PREMIUM TOOLS AND PRIVATE COMMUNITY UPDATES",
      icon: ShieldCheck,
      color: "text-blue-400",
      borderColor: "border-blue-400/20",
      bgColor: "bg-blue-400/5",
      buttonVariant: "secondary" as const,
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
          <Send className="w-6 h-6 text-primary" />
          Official Telegram Channels
        </h2>
        <p className="text-muted-foreground">
          Join our official communities to get the latest updates, free accounts, and exclusive tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((channel, index) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`hardware-card h-full flex flex-col ${channel.borderColor} ${channel.bgColor}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded bg-black/50 border ${channel.borderColor}`}>
                    <channel.icon className={`w-6 h-6 ${channel.color}`} />
                  </div>
                  <Zap className="w-4 h-4 text-muted-foreground/30" />
                </div>
                <CardTitle className={`text-xl font-bold ${channel.color}`}>{channel.name}</CardTitle>
                <CardDescription className="text-white/70 font-medium">
                  {channel.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6">
                <Button 
                  className="w-full font-bold group" 
                  variant={channel.buttonVariant}
                  onClick={() => window.open(channel.link, "_blank")}
                >
                  JOIN CHANNEL
                  <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="hardware-card border-dashed border-muted-foreground/20 bg-transparent">
        <CardContent className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
            <Send className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-tight">Stay Connected</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Our Telegram channels are the only place where we post fresh combos, private scripts, and tool updates. Make sure to enable notifications!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
