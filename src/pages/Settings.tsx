import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { AppLayout } from "@/components/AppLayout";
import { Moon, Sun, Monitor, Bell, Lock, User, Palette, Brain, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    quizReminders: true,
    communityUpdates: false,
    streakAlerts: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    toast({ title: "Settings saved!", description: "Your preferences have been updated." });
  };

  return (
    <AppLayout title="Settings">
      <div className="p-8 max-w-2xl">
        <div className="space-y-6">
          {/* Appearance */}
          <Card className="glass border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" /> Appearance
              </CardTitle>
              <CardDescription className="text-xs">Customize how LearnEase looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "system", icon: Monitor, label: "System" },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      theme === value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card className="glass border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Display Name</Label>
                  <Input placeholder="Your name" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" placeholder="your@email.com" className="h-9" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Bio</Label>
                <Input placeholder="Tell others about yourself..." className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Study Level</Label>
                <Select>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["High School", "Undergraduate", "Postgraduate", "Professional"].map(l => (
                      <SelectItem key={l} value={l.toLowerCase().replace(" ", "-")} className="text-sm">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card className="glass border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> AI Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Mentor Persona</Label>
                  <Select>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choose style" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Friendly", "Strict", "Socratic", "Motivational"].map(p => (
                        <SelectItem key={p} value={p.toLowerCase()} className="text-sm">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Explanation Style</Label>
                  <Select>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Auto", "Visual", "Step-by-step", "Examples only", "Concise"].map(s => (
                        <SelectItem key={s} value={s.toLowerCase()} className="text-sm">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Context-aware responses</p>
                  <p className="text-xs text-muted-foreground">AI remembers your learning history</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "quizReminders" as const, label: "Quiz Reminders", desc: "Get reminded to take daily quizzes" },
                { key: "communityUpdates" as const, label: "Community Updates", desc: "Activity in your study circles" },
                { key: "streakAlerts" as const, label: "Streak Alerts", desc: "Don't lose your learning streak" },
                { key: "weeklyReport" as const, label: "Weekly Progress Report", desc: "Summary of your learning week" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={(v) => setNotifications(n => ({ ...n, [key]: v }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="glass border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Current Password</Label>
                <Input type="password" placeholder="••••••••" className="h-9" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">New Password</Label>
                  <Input type="password" placeholder="Min. 6 characters" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm Password</Label>
                  <Input type="password" placeholder="Repeat password" className="h-9" />
                </div>
              </div>
              <Button size="sm" variant="outline">Update Password</Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <Shield className="w-4 h-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Clear chat history</p>
                  <p className="text-xs text-muted-foreground">Permanently delete all your conversations</p>
                </div>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
                </Button>
              </div>
              <Separator className="opacity-30" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Delete account</p>
                  <p className="text-xs text-muted-foreground">This action cannot be undone</p>
                </div>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-primary to-accent text-white border-0" onClick={handleSave}>
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
