import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLayout } from "@/components/AppLayout";
import { Search, Users, Radio, Lock, Unlock, Plus, MessageSquare, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const studyCircles = [
  { name: "Python Beginners", description: "Learn Python from scratch with fellow beginners", members: 142, category: "Beginner", tags: ["Programming"], live: true, joined: true, color: "bg-blue-500/10 text-blue-500" },
  { name: "Data Structures & Algorithms", description: "Master DSA for technical interviews", members: 89, category: "Intermediate", tags: ["Computer Science"], live: true, joined: true, color: "bg-purple-500/10 text-purple-500" },
  { name: "Machine Learning Study Group", description: "Dive deep into ML concepts and implementations", members: 67, category: "Advanced", tags: ["AI/ML"], live: false, joined: false, color: "bg-pink-500/10 text-pink-500" },
  { name: "Web Development Bootcamp", description: "Full-stack web development with React and Node", members: 124, category: "Intermediate", tags: ["Web Dev"], live: true, joined: false, color: "bg-green-500/10 text-green-500" },
  { name: "DBMS Fundamentals", description: "Database management systems and SQL", members: 56, category: "Beginner", tags: ["Database"], live: false, joined: false, color: "bg-yellow-500/10 text-yellow-600" },
  { name: "Competitive Programming", description: "Prepare for coding competitions", members: 93, category: "Advanced", tags: ["Programming"], live: true, joined: false, color: "bg-red-500/10 text-red-500" },
];

const recentActivity = [
  { user: "Arjun K.", action: "shared a note in Python Beginners", time: "2m ago", avatar: "" },
  { user: "Priya S.", action: "asked a question in DSA group", time: "5m ago", avatar: "" },
  { user: "Rahul V.", action: "completed a quiz in Web Dev", time: "12m ago", avatar: "" },
  { user: "Sneha P.", action: "uploaded ML resources", time: "18m ago", avatar: "" },
];

const categoryColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const Community = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [circles, setCircles] = useState(studyCircles);
  const { toast } = useToast();

  const filtered = circles.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.category === filter || (filter === "Joined" && c.joined) || (filter === "Live" && c.live);
    return matchSearch && matchFilter;
  });

  const toggleJoin = (name: string) => {
    setCircles(prev => prev.map(c => {
      if (c.name !== name) return c;
      const next = { ...c, joined: !c.joined };
      toast({ title: next.joined ? `Joined ${name}!` : `Left ${name}`, description: next.joined ? "You're now part of this study circle." : "You've left this circle." });
      return next;
    }));
  };

  const myCircles = circles.filter(c => c.joined);
  const discover = filtered.filter(c => !c.joined);

  const headerRight = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search circles..." className="pl-9 w-52 h-9 glass" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white border-0">
        <Plus className="w-4 h-4 mr-1.5" /> New Circle
      </Button>
    </div>
  );

  return (
    <AppLayout title="Community" headerRight={headerRight}>
      <div className="p-8 space-y-8">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {["All", "Joined", "Live", "Beginner", "Intermediate", "Advanced"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f ? "bg-primary text-white shadow-lg shadow-primary/25" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "Live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />}
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* My Circles */}
            {myCircles.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground tracking-widest mb-4">MY CIRCLES ({myCircles.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myCircles.map((circle) => (
                    <Card key={circle.name} className="glass border-primary/20 hover:border-primary/40 transition-all">
                      <CardContent className="pt-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${circle.color} flex items-center justify-center shrink-0`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex gap-1.5">
                            {circle.live && (
                              <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs gap-1">
                                <Radio className="w-2.5 h-2.5" /> Live
                              </Badge>
                            )}
                            <Badge className={`text-xs ${categoryColors[circle.category]}`}>{circle.category}</Badge>
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{circle.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{circle.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> {circle.members} members
                          </span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                              <MessageSquare className="w-3 h-3" /> Chat
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toggleJoin(circle.name)}>
                              Leave
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Discover */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground tracking-widest mb-4">
                DISCOVER {search || filter !== "All" ? `— ${filtered.filter(c => !c.joined).length} results` : ""}
              </h2>
              {discover.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl">
                  <Unlock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No circles match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discover.map((circle) => (
                    <Card key={circle.name} className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all group">
                      <CardContent className="pt-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${circle.color} flex items-center justify-center shrink-0`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex gap-1.5">
                            {circle.live ? (
                              <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs gap-1"><Radio className="w-2.5 h-2.5" /> Live</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Offline</Badge>
                            )}
                            <Badge className={`text-xs ${categoryColors[circle.category]}`}>{circle.category}</Badge>
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{circle.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{circle.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> {circle.members} members
                          </span>
                          <Button size="sm" className="h-7 text-xs bg-primary text-white" onClick={() => toggleJoin(circle.name)}>
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Activity feed */}
          <div className="space-y-6">
            <Card className="glass border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={item.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {item.user.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs"><span className="font-medium">{item.user}</span> {item.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {["#arrays", "#recursion", "#neural-nets", "#sql-joins", "#big-O", "#react-hooks", "#sorting"].map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-xs">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <p className="text-sm font-semibold">Weekly Challenge</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Answer 5 questions in the DSA circle before Sunday to earn 50 tokens!</p>
                <Button size="sm" className="w-full text-xs">Participate</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Community;
