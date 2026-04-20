import { useState } from "react";
import { 
  Search, 
  Settings, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Terminal,
  UserSearch,
  LayoutDashboard,
  Shield,
  Unlock,
  Activity,
  Send,
  Bomb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

const SECTIONS = [
  {
    title: "Main",
    items: [
      { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
      { id: "official-channels", name: "Official Channels", icon: Send },
    ]
  },
  {
    title: "Tools",
    items: [
      { id: "roblox-lookup", name: "Roblox Look Up", icon: UserSearch },
      { id: "python-encryptor", name: "Python Encryptor", icon: Shield },
      { id: "python-decoder", name: "Python Decoder", icon: Unlock },
      { id: "sms-bomber", name: "SMS Bomber", icon: Bomb },
    ]
  }
];

export function Sidebar({ activeTool, setActiveTool }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card hardware-border">
      <div className="p-4 flex items-center justify-between">
        <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-300", 
          isCollapsed && !mobile ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Terminal className="text-black w-5 h-5" />
          </div>
          <span className="font-bold text-lg whitespace-nowrap">OMNI MULTI TOOL SERVICE</span>
        </div>
        {!mobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        )}
      </div>

      <Separator className="bg-border/50" />

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className={cn(
                "px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all duration-300",
                isCollapsed && !mobile ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
              )}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={activeTool === tool.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-200",
                      activeTool === tool.id && "bg-primary/10 text-primary hover:bg-primary/20",
                      isCollapsed && !mobile ? "px-2" : "px-4"
                    )}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <tool.icon className={cn("w-5 h-5 shrink-0", activeTool === tool.id && "text-primary")} />
                    <span className={cn(
                      "transition-all duration-300 overflow-hidden whitespace-nowrap",
                      isCollapsed && !mobile ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                      {tool.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-border/50" />

      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            isCollapsed && !mobile ? "px-2" : "px-4"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isCollapsed && !mobile ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Settings
          </span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col h-screen transition-all duration-300 sticky top-0",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="bg-card hardware-border">
                <Menu className="w-5 h-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border">
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
