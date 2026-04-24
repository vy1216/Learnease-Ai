import { supabase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/AppLayout";
import { ChangeEvent, useState } from "react";
import { Camera, Trophy, Flame, BookOpen, Star, Award, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const achievements = [
  { icon: Flame, label: "18-Day Streak", color: "text-orange-500 bg-orange-500/10" },
  { icon: Trophy, label: "Quiz Champion", color: "text-yellow-500 bg-yellow-500/10" },
  { icon: BookOpen, label: "100 Topics", color: "text-blue-500 bg-blue-500/10" },
  { icon: Star, label: "Top Contributor", color: "text-purple-500 bg-purple-500/10" },
];

const subjects = [
  { name: "Calculus", percent: 40 },
  { name: "AI Ethics", percent: 80 },
  { name: "Prompt Engineering", percent: 20 },
  { name: "Data Structures", percent: 65 },
];

const mentors = [
  { name: "Dr. Sharma", role: "Mathematics", avatar: "" },
  { name: "Prof. Gupta", role: "Computer Science", avatar: "" },
];

const friends = [
  { name: "Arjun K.", role: "DSA Enthusiast", avatar: "" },
  { name: "Priya S.", role: "ML Explorer", avatar: "" },
  { name: "Rahul V.", role: "Web Dev", avatar: "" },
];

const Profile = () => {
  const { toast } = useToast();
  const [userImage, setUserImage] = useState("/avatars/user.png");
  const [username] = useState(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.username || payload.email?.split("@")[0] || "Learner";
      } catch {}
    }
    return "Learner";
  });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!supabase) {
      toast({ title: "Storage not configured", variant: "destructive" });
      return;
    }
    try {
      const filePath = `profile-images/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("uploads").upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
      setUserImage(data.publicUrl);
      toast({ title: "Profile picture updated!" });
    } catch (error: any) {
      toast({ title: "Failed to upload image", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Profile">
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile header */}
          <Card className="glass">
            <CardContent className="pt-8 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative shrink-0">
                  <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                    <AvatarImage src={userImage} alt={username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                      {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </div>
                  </label>
                  <input type="file" id="avatar-upload" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{username}</h2>
                  <p className="text-muted-foreground text-sm mt-1">B.Tech CSE · 3rd Year</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <Badge variant="secondary" className="text-xs">🔥 18-day streak</Badge>
                    <Badge variant="secondary" className="text-xs">⭐ 240 tokens</Badge>
                    <Badge variant="secondary" className="text-xs">📚 5 subjects</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center shrink-0">
                  {[
                    { value: "76", label: "AI Score" },
                    { value: "84%", label: "Quiz Acc." },
                    { value: "#8", label: "Global Rank" },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Achievements */}
            <Card className="glass border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2.5 glass rounded-xl p-3">
                      <div className={`w-8 h-8 rounded-lg ${color.split(" ")[1]} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${color.split(" ")[0]}`} />
                      </div>
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subject progress */}
            <Card className="glass border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Subject Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjects.map(subject => (
                  <div key={subject.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-muted-foreground">{subject.percent}%</span>
                    </div>
                    <Progress value={subject.percent} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mentors */}
            <Card className="glass border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> My Mentors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mentors.map(mentor => (
                  <div key={mentor.name} className="flex items-center gap-3 glass rounded-xl p-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={mentor.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {mentor.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{mentor.name}</p>
                      <p className="text-xs text-muted-foreground">{mentor.role}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs">Message</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Friends */}
            <Card className="glass border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Study Buddies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {friends.map(friend => (
                  <div key={friend.name} className="flex items-center gap-3 glass rounded-xl p-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback className="text-xs bg-accent/10 text-accent">
                        {friend.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{friend.name}</p>
                      <p className="text-xs text-muted-foreground">{friend.role}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
