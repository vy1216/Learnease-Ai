import { apiUrl, supabase } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/AppLayout";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  UploadCloud, Plus, Zap, Users, FileText, Send,
  Flame, Trophy, BookOpen, ArrowRight, Brain, X
} from "lucide-react";

interface QuizResult { score: number; total: number; avgTimeMs: number; improvements: { topic: string; count: number }[]; percentage?: number; grade?: string; }
interface ReportItem { id: string; question: string; correct: boolean; userAnswer: string; correctAnswer: string; explanation: string; timeMs: number; difficulty: string; topic: string; }

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("Learner");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [latestQuiz, setLatestQuiz] = useState<QuizResult | null>(null);
  const [latestResultId, setLatestResultId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [dashboardQuery, setDashboardQuery] = useState("");
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Decode JWT for user info
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.username) setUsername(payload.username);
        else if (payload.email) setUsername(payload.email.split("@")[0]);
      } catch {}
    }
    // Fetch latest quiz result
    const fetchResults = async () => {
      try {
        const res = await fetch(apiUrl("/api/quiz-results"));
        if (res.ok) {
          const js = await res.json();
          if (js.length) {
            const last = js[0]; // newest first
            setLatestQuiz({ score: last.score, total: last.total, avgTimeMs: last.avgTimeMs, improvements: last.improvements, percentage: last.percentage, grade: last.grade });
            setLatestResultId(last.id);
          }
        }
      } catch {}
    };
    fetchResults();
    // Try to fetch live XP/streak from /api/me
    const fetchMe = async () => {
      if (!token) return;
      try {
        const res = await fetch(apiUrl("/api/me"), { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const me = await res.json();
          if (me.username) setUsername(me.username);
          if (me.xp != null) setXp(me.xp);
          if (me.streak != null) setStreak(me.streak);
        }
      } catch {}
    };
    fetchMe();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await fetch(apiUrl("/api/upload"), { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      toast({ title: "File uploaded!", description: `${selectedFile.name} — ${data.chunks || 0} chunks indexed for AI.` });
      setSelectedFile(null);
      setFileName("");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const openReport = async () => {
    if (!latestResultId) return;
    try {
      const res = await fetch(apiUrl(`/api/quiz-report/${latestResultId}`));
      if (!res.ok) { toast({ title: "Report not found", variant: "destructive" }); return; }
      setReport(await res.json());
      setShowReport(true);
    } catch { toast({ title: "Could not load report", variant: "destructive" }); }
  };

  const sendQuery = () => {
    const q = dashboardQuery.trim();
    if (q) navigate(`/chat?q=${encodeURIComponent(q)}`);
  };

  const gradeColor = (g?: string) => {
    if (!g) return "text-muted-foreground";
    if (g.startsWith("A")) return "text-green-500";
    if (g === "B") return "text-blue-500";
    if (g === "C") return "text-yellow-500";
    return "text-red-500";
  };

  const headerRight = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs">
        <Flame className="w-3.5 h-3.5 text-orange-500" />
        <span className="font-semibold">{streak}d streak</span>
      </div>
      <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs">
        <Zap className="w-3.5 h-3.5 text-yellow-500" />
        <span className="font-semibold">{xp} XP</span>
      </div>
      <Link to="/profile">
        <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
          <AvatarFallback className="text-[11px] font-bold avatar-glow text-white">
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );

  return (
    <AppLayout headerRight={headerRight}>
      <div className="p-7 space-y-7 max-w-[1200px] mx-auto animate-fade-in">

        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Good day, {username} 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's where you left off — keep the momentum going.</p>
          </div>
          <Button onClick={() => navigate("/quiz")} className="btn-glow text-white border-0 gap-2 hidden sm:flex">
            <Zap className="w-4 h-4" /> Take a Quiz
          </Button>
        </div>

        {/* Top row: mentor ask + quick stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Ask mentor */}
          <Card className="lg:col-span-2 glass border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl avatar-glow flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <p className="font-bold">Spark.E</p>
                  <p className="text-xs text-muted-foreground">Your AI Mentor · Ask me anything</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="e.g. Explain recursion with examples…"
                  className="glass rounded-xl border-border/50 focus:border-primary/50"
                  value={dashboardQuery}
                  onChange={(e) => setDashboardQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendQuery()}
                />
                <Button className="btn-glow text-white border-0 rounded-xl shrink-0 gap-1" onClick={sendQuery}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Explain Big-O notation", "What is DBMS normalization?", "Summarise my notes"].map(p => (
                  <button key={p} onClick={() => { setDashboardQuery(p); navigate(`/chat?q=${encodeURIComponent(p)}`); }}
                    className="text-xs glass px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {[
              { icon: Flame, label: "Day Streak", value: `${streak}d`, sub: "Keep it up!", color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: Zap, label: "Total XP", value: xp.toString(), sub: "Earned from learning", color: "text-yellow-500", bg: "bg-yellow-500/10" },
            ].map(({ icon: Icon, label, value, sub, color, bg }) => (
              <Card key={label} className="glass border-border/50">
                <CardContent className="pt-4 pb-4">
                  <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-2xl font-extrabold">{value}</p>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action items + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground">ACTION ITEMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Integrals checkpoint", sub: "Due today", progress: 40 },
                { label: "AI Ethics essay feedback", sub: "Mentor review", progress: 75 },
                { label: "Upload robotics lab notes", sub: "Pending upload", progress: 8 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Progress value={item.progress} className="w-20 h-1.5" />
                    <span className="text-xs text-muted-foreground w-7 text-right">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground">PRIORITY ALERTS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { variant: "destructive" as const, label: "Urgent", title: "Mentor review pending", desc: "AI Ethics essay needs revision before 18:00." },
                { variant: "default" as const, label: "Upload", title: "File not indexed", desc: "Robotics lab PDF hasn't been embedded yet." },
                { variant: "secondary" as const, label: "Compete", title: "Tournament slot closing", desc: "City Olympiad qualifiers close in 2 hours." },
              ].map((a) => (
                <div key={a.title} className="flex items-start gap-3 p-3 glass rounded-xl">
                  <Badge variant={a.variant} className="shrink-0 text-xs mt-0.5">{a.label}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resource Studio */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground">RESOURCE STUDIO</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {fileName && (
                  <span className="text-xs glass px-2 py-1 rounded-lg text-muted-foreground max-w-[150px] truncate">{fileName}</span>
                )}
                <input type="file" onChange={handleFileChange} className="hidden" id="dash-file-upload" />
                <label htmlFor="dash-file-upload" className="cursor-pointer">
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <span><Plus className="w-3.5 h-3.5" /> Add file</span>
                  </Button>
                </label>
                <Button size="sm" onClick={handleFileUpload} disabled={!selectedFile} className="btn-glow text-white border-0 gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3">Recent uploads</p>
              <div className="space-y-2">
                {[
                  { name: "Calculus 101.pdf", meta: "18 chunks · calc, semester1", size: "2.5 MB" },
                  { name: "AI Ethics Playbook.pdf", meta: "22 chunks · ethics, debate", size: "1.2 MB" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl glass card-hover">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.meta}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{f.size}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground px-1 mt-2">Drop PDFs above to index them for AI answers.</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3">Pinned note</p>
              <Textarea
                placeholder="Jot down a quick note…"
                className="glass rounded-xl border-border/50 min-h-[100px] text-sm resize-none focus:border-primary/50"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <Button size="sm" className="mt-2 gap-1.5" variant="outline" onClick={() => { if (note.trim()) toast({ title: "Note saved!" }); }}>
                Save Note
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Community + Timeline + Habits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground">COMMUNITY SIGNALS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[{ name: "Calculus sprint circle", n: "18" }, { name: "Ethics lounge", n: "9" }, { name: "Prompt lab", n: "14" }].map(c => (
                <div key={c.name} className="flex justify-between items-center py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <p className="text-sm">{c.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{c.n}</Badge>
                </div>
              ))}
              <Link to="/community">
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs gap-1 text-primary">View all circles <ArrowRight className="w-3 h-3" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground">TODAY'S SCHEDULE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: "17:00", task: "Upload robotics lab notes", done: false },
                { time: "18:15", task: "Calculus sprint session", done: false },
                { time: "20:30", task: "Quiz reflection + review", done: false },
              ].map(({ time, task, done }) => (
                <div key={time} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono w-10 shrink-0">{time}</span>
                  <div className={`flex-1 text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{task}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground">FOCUS HABITS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-extrabold">2h 40m</p>
                <p className="text-xs text-muted-foreground">Study time today · +0.8h vs last week</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold">{xp} XP</p>
                <p className="text-xs text-muted-foreground">Total earned · +12 today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quest board */}
        <section>
          <h2 className="text-base font-bold mb-4">Quest Board <span className="text-primary ml-1 font-normal text-sm">· Keep the streak alive</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Zap, color: "from-amber-400 to-orange-500", title: "Focus Flame", desc: "Complete 5 study sessions this week.", progress: 60 },
              { Icon: Users, color: "from-blue-400 to-indigo-500", title: "Mentor Ally", desc: "Answer 3 peer questions in 24 hours.", progress: 33 },
              { Icon: UploadCloud, color: "from-emerald-400 to-green-500", title: "Uploader Supreme", desc: "Index 10 documents for AI.", progress: 20 },
            ].map(({ Icon, color, title, desc, progress }) => (
              <Card key={title} className="glass border-border/50 card-hover">
                <CardContent className="pt-5 pb-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-bold text-sm mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground mb-3">{desc}</p>
                  <Progress value={progress} className="h-1.5 mb-1" />
                  <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Quiz */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground">LATEST QUIZ RESULT</CardTitle>
              <Button size="sm" variant="ghost" className="text-xs gap-1 text-primary" onClick={() => navigate("/quiz")}>
                <Zap className="w-3.5 h-3.5" /> New Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {latestQuiz ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-2xl font-extrabold">{latestQuiz.score}/{latestQuiz.total}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className={`text-2xl font-extrabold ${gradeColor(latestQuiz.grade)}`}>{latestQuiz.grade || "—"}</p>
                    <p className="text-xs text-muted-foreground">Grade</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-2xl font-extrabold">{latestQuiz.percentage ?? Math.round((latestQuiz.score / latestQuiz.total) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-2xl font-extrabold">{(latestQuiz.avgTimeMs / 1000).toFixed(1)}s</p>
                    <p className="text-xs text-muted-foreground">Avg time</p>
                  </div>
                </div>
                {latestQuiz.improvements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs text-muted-foreground">Focus on:</span>
                    {latestQuiz.improvements.map((imp, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">{imp.topic} ({imp.count})</Badge>
                    ))}
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={openReport} className="gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> View full report
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">No quiz taken yet</p>
                  <p className="text-xs text-muted-foreground">Take your first quiz to see results here.</p>
                </div>
                <Button onClick={() => navigate("/quiz")} className="btn-glow text-white border-0 shrink-0 gap-1.5">
                  <Zap className="w-4 h-4" /> Take First Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Modal */}
      {showReport && report && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowReport(false)}>
          <Card className="w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col animate-scale-in">
            <CardHeader className="shrink-0 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quiz Report</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {report.topic} · {report.score}/{report.total} · Grade: <span className={gradeColor(report.grade)}>{report.grade}</span>
                  </p>
                </div>
                <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {report.details?.map((item: ReportItem, idx: number) => (
                <div key={item.id} className={`border rounded-xl p-4 ${item.correct ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.correct ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                      Q{idx + 1} · {item.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.timeMs}ms</span>
                  </div>
                  <p className="text-sm font-medium mb-2">{item.question}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>Your answer: <span className={item.correct ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>{item.userAnswer || "—"}</span></div>
                    <div>Correct: <span className="text-green-500 font-semibold">{item.correctAnswer}</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.explanation}</p>
                </div>
              ))}
              {report.advice?.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <p className="text-sm font-bold mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> AI Advice</p>
                  <div className="space-y-2">
                    {report.advice.map((a: string, i: number) => (
                      <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{a}</ReactMarkdown>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border/40 shrink-0 flex gap-2">
              <Button onClick={() => setShowReport(false)} variant="outline" className="flex-1">Close</Button>
              <Button onClick={() => { setShowReport(false); navigate("/quiz"); }} className="flex-1 btn-glow text-white border-0">New Quiz</Button>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};


export default Dashboard;
