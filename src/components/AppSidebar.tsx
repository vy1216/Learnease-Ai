import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, Bot, GitBranch, Users, Trophy,
  User, Settings, HelpCircle, LogOut, BookOpen, Zap, Star, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const NAV = [
  {
    label: "LEARN",
    items: [
      { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
      { to: "/chat",       icon: MessageSquare,   label: "Chat" },
      { to: "/mentor",     icon: Bot,             label: "AI Tutor" },
      { to: "/materials",  icon: BookOpen,        label: "Materials" },
      { to: "/skill-tree", icon: GitBranch,       label: "Progress" },
      { to: "/quiz",       icon: Zap,             label: "Quiz" },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { to: "/community",   icon: Users,  label: "Peers" },
      { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { to: "/profile",  icon: User,        label: "Profile" },
      { to: "/settings", icon: Settings,    label: "Settings" },
      { to: "/help",     icon: HelpCircle,  label: "Help" },
    ],
  },
];

export const AppSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const username = (() => {
    const token = localStorage.getItem("authToken");
    if (!token) return "User";
    try { return (JSON.parse(atob(token.split(".")[1])) as any).username || "User"; }
    catch { return "User"; }
  })();

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("le_chat_id");
    localStorage.removeItem("le_tutor_id");
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "flex flex-col sticky top-0 h-screen border-r border-border/50 bg-card/60 backdrop-blur-xl transition-all duration-300 shrink-0 z-30",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-border/40 shrink-0", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-xl btn-glow flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-sm tracking-tight text-gradient">LearnEase</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 space-y-6">
        {NAV.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[9px] font-bold text-muted-foreground/50 tracking-[0.15em] px-3 mb-1.5">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => {
                const active = pathname === to;
                const link = (
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                      active
                        ? "nav-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("shrink-0 transition-colors", active ? "text-primary" : "", collapsed ? "w-[18px] h-[18px]" : "w-4 h-4")} />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
                return (
                  <li key={to}>
                    {collapsed ? (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
                      </Tooltip>
                    ) : link}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-border/40 p-2 space-y-1 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass mb-1">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className="text-[10px] font-bold avatar-glow text-white">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold truncate">{username}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-9 text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 text-muted-foreground hover:text-destructive text-xs h-9" onClick={handleSignOut}>
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground" onClick={() => setCollapsed(c => !c)}>
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
