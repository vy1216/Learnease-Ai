import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppLayout } from "@/components/AppLayout";
import { Download, TrendingUp, Flame, Target, Award, BookOpen } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, RadialBarChart, RadialBar,
  PolarAngleAxis, BarChart, Bar, XAxis, Tooltip, CartesianGrid,
} from "recharts";

const progressScore = 76;
const subjects = [
  { name: "Calculus", percent: 40, level: "Intermediate", detail: "Integration by parts", color: "#818CF8", nextMilestone: "Differential Equations" },
  { name: "AI Ethics", percent: 80, level: "Advanced", detail: "Philosophy of mind", color: "#34D399", nextMilestone: "Bias in AI Systems" },
  { name: "Prompt Engineering", percent: 20, level: "Beginner", detail: "Live lab practice", color: "#F472B6", nextMilestone: "Few-shot Prompting" },
  { name: "Data Structures", percent: 65, level: "Intermediate", detail: "Trees & Graphs", color: "#FBBF24", nextMilestone: "Advanced Graph Algorithms" },
];
const trajectory = [
  { day: "Jan", value: 40 }, { day: "Feb", value: 48 }, { day: "Mar", value: 52 },
  { day: "Apr", value: 63 }, { day: "May", value: 76 },
];
const historyBars = [
  { d: "M", v: 6 }, { d: "T", v: 5 }, { d: "W", v: 7 }, { d: "T", v: 4 }, { d: "F", v: 8 }, { d: "S", v: 6 }, { d: "S", v: 3 },
];
const radialData = [{ value: progressScore, fill: "#818CF8" }];

const levelColors: Record<string, string> = {
  Beginner: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Intermediate: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Advanced: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const SkillTree = () => {
  const handleDownloadReport = () => {
    const win = window.open("", "report", "width=1024,height=768");
    if (!win) return;
    const style = `body{font-family:system-ui;margin:32px;color:#0f172a;}.grid{display:grid;gap:16px;}.card{border:1px solid #e5e7eb;border-radius:16px;padding:20px;}.title{font-size:18px;font-weight:700;}.score{font-size:64px;font-weight:800;color:#7c3aed;}.muted{color:#64748b;font-size:14px;}`;
    const subjectsHtml = subjects.map(s => `<div class="card"><div class="title">${s.name}</div><p><strong>${s.percent}%</strong> · ${s.level}</p><p class="muted">${s.detail}</p></div>`).join("");
    const html = `<html><head><title>LearnEase Report Card</title><style>${style}</style></head><body><div class="grid"><div class="card"><div class="title">AI Progress Score</div><div class="score">${progressScore}</div><p class="muted">Overall learning consistency</p></div><div class="grid" style="grid-template-columns:repeat(2,1fr)">${subjectsHtml}</div></div></body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const headerRight = (
    <Button size="sm" variant="outline" onClick={handleDownloadReport} className="gap-1.5">
      <Download className="w-4 h-4" /> Export Report
    </Button>
  );

  return (
    <AppLayout title="Progress" headerRight={headerRight}>
      <div className="p-8 space-y-8">
        {/* Score hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass col-span-1 lg:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(var(--muted))" }} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: "28px", fontWeight: 800 }}>
                      {progressScore}
                    </text>
                    <text x="50%" y="62%" textAnchor="middle" style={{ fontSize: "11px", fill: "hsl(var(--muted-foreground))" }}>
                      AI Score
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm font-medium mt-2">Overall Progress</p>
              <p className="text-xs text-muted-foreground mt-1">On track to advance by May 25</p>
            </CardContent>
          </Card>

          <Card className="glass col-span-1 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Learning Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={2.5} dot={{ fill: "#818CF8", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Flame, label: "Day Streak", value: "18", sub: "days active", color: "text-orange-500", bg: "bg-orange-500/10" },
            { icon: Target, label: "Quiz Accuracy", value: "84%", sub: "this month", color: "text-green-500", bg: "bg-green-500/10" },
            { icon: BookOpen, label: "Topics Mastered", value: "5", sub: "this semester", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Award, label: "Tokens Earned", value: "240", sub: "+40 streak bonus", color: "text-yellow-500", bg: "bg-yellow-500/10" },
          ].map(({ icon: Icon, label, value, sub, color, bg }) => (
            <Card key={label} className="glass">
              <CardContent className="pt-5">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium mt-0.5">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subject trees */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground tracking-widest mb-4">SUBJECT SKILL TREES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <Card key={subject.name} className="glass border-border/60 hover:border-primary/30 transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{subject.detail}</p>
                    </div>
                    <Badge className={`text-xs ${levelColors[subject.level]}`}>{subject.level}</Badge>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span className="font-semibold" style={{ color: subject.color }}>{subject.percent}%</span>
                    </div>
                    <Progress value={subject.percent} className="h-2" style={{ "--progress-color": subject.color } as React.CSSProperties} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="text-xs text-muted-foreground">Next:</span>
                    <Badge variant="secondary" className="text-xs">{subject.nextMilestone}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Weekly activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Weekly Study Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyBars} barSize={24}>
                    <XAxis dataKey="d" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                      formatter={(v) => [`${v}h`, "Hours"]}
                    />
                    <Bar dataKey="v" fill="#818CF8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">AI-Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { task: "Complete integration by parts exercises", priority: "High", subject: "Calculus" },
                { task: "Explore bias mitigation techniques", priority: "Medium", subject: "AI Ethics" },
                { task: "Practice few-shot prompting", priority: "Low", subject: "Prompt Engineering" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    item.priority === "High" ? "bg-red-500" : item.priority === "Medium" ? "bg-yellow-500" : "bg-blue-500"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{item.task}</p>
                    <p className="text-xs text-muted-foreground">{item.subject}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{item.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SkillTree;
