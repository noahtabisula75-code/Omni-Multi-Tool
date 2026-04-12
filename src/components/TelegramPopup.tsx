import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, ExternalLink } from "lucide-react";

export function TelegramPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<1 | 2>(1);
  const [randomMessage, setRandomMessage] = useState("");

  const randomMessages = [
    "FREE ACCOUNTS AND TXT AND TOOLS ARE IN HERE TG CHANNEL",
    "GET EXCLUSIVE ACCESS TO PREMIUM SCRIPTS!",
    "JOIN NOW FOR DAILY FREE COMBOS AND TOOLS!",
    "THE BEST TG CHANNEL FOR SCRIPTS AND ACCOUNTS!",
    "DON'T MISS OUT ON OUR PRIVATE TOOLS AND TXT FILES!",
    "JOIN THE COMMUNITY AND GET FREE STUFF DAILY!",
    "LATEST UPDATES AND EXCLUSIVE CONTENT INSIDE!",
    "YOUR ONE-STOP SHOP FOR FREE TOOLS AND ACCOUNTS!"
  ];

  const randomizeContent = () => {
    setSelectedChannel(Math.random() > 0.5 ? 1 : 2);
    const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    setRandomMessage(msg);
  };

  useEffect(() => {
    // Initial show after a short delay (5 seconds)
    const initialTimer = setTimeout(() => {
      randomizeContent();
      setIsOpen(true);
    }, 5000);

    // Recurring show every 10 minutes to avoid being annoying
    const interval = setInterval(() => {
      randomizeContent();
      setIsOpen(true);
    }, 600000); // 10 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []); // Run only once on mount

  const channelData = {
    1: {
      title: "Channel 1",
      link: "https://t.me/txtfilegenerator",
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
      buttonClass: "bg-primary text-black hover:bg-primary/90",
      description: "FREE ACCOUNTS AND TXT AND TOOLS ARE IN HERE TG CHANNEL"
    },
    2: {
      title: "Channel 2",
      link: "https://t.me/+Xc898Vj7MYA4YWVl",
      color: "text-blue-400",
      bgColor: "bg-blue-400/5",
      borderColor: "border-blue-400/20",
      buttonClass: "bg-blue-500 text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
      description: "EXCLUSIVE ACCESS: FREE ACCOUNTS AND TOOLS IN OUR PRIVATE CHANNEL"
    }
  };

  const current = channelData[selectedChannel];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`sm:max-w-[425px] hardware-card bg-black/95 text-white ${current.borderColor}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${current.color}`}>
            <Send className="w-5 h-5" />
            {current.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Official System Notification
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <div className={`p-6 rounded-lg border ${current.borderColor} ${current.bgColor} space-y-6 text-center`}>
            <p className="text-sm font-bold tracking-tight leading-relaxed uppercase">
              {randomMessage || current.description}
            </p>
            <Button 
              className={`w-full font-bold h-12 text-lg transition-all active:scale-95 ${current.buttonClass}`}
              onClick={() => window.open(current.link, "_blank")}
            >
              JOIN BUTTON
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-xs text-muted-foreground hover:text-white">
            CLOSE NOTIFICATION
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
