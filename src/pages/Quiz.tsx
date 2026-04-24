import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, BrainCircuit, RotateCcw, ArrowRight, Trophy, Clock, Target, Zap, Brain } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { apiUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Question = {
  id: string; type: "mcq" | "tf" | "short";
  question: string; options?: string[];
  answer: string; explanation: string;
  topic: string; difficulty: "easy" | "medium" | "hard";
};
type Quiz = { id: string; topic: string; questions: Question[]; };

const diffBadge: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const gradeStyle = (g: string) => {
  if (g.startsWith("A")) return { color: "text-green-500", bg: "bg-green-500/10", emoji: "🎉" };
  if (g === "B") return { color: "text-blue-500", bg: "bg-blue-500/10", emoji: "👍" };
  if (g === "C") return { color: "text-yellow-500", bg: "bg-yellow-500/10", emoji: "📚" };
  return { color: "text-red-500", bg: "bg-red-500/10", emoji: "💪" };
};

const Quiz = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [state, setState] = useState<"loading" | "intro" | "in-progress" | "completed">("loading");
  const [topic, setTopic] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; timeMs: number }[]>([]);
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const current = useMemo(() => quiz?.questions[currentIdx] ?? null, [quiz, currentIdx]);
  const progress = useMemo(() => quiz ? (currentIdx / quiz.questions.length) * 100 : 0, [quiz, currentIdx]);

  // Load quiz if quizId provided
  useEffect(() => {
    const id = params.get("quizId");
    if (id) {
      loadQuiz(id);
    } else {
      setState("intro");
    }
  }, [params]);

  // Timer
  useEffect(() => {
    if (state !== "in-progress") return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const loadQuiz = async (id: string) => {
    setState("loading");
    try {
      const r = await fetch(apiUrl(`/api/quiz/${id}`));
      if (!r.ok) throw new Error();
      const q = await r.json();
      setQuiz(q);
      setCurrentIdx(0);
      setSelected("");
      setIsAnswered(false);
      setAnswers([]);
      setElapsed(0);
      setQuestionStart(Date.now());
      setState("in-progress");
    } catch {
      toast({ title: "Could not load quiz", variant: "destructive" });
      setState("intro");
    }
  };

  const generateQuiz = async () => {
    if (!topic.trim()) { toast({ title: "Enter a topic first", variant: "destructive" }); return; }
    setGenerating(true);
    try {
      const r = await fetch(apiUrl("/api/quiz/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      await loadQuiz(d.id);
    } catch {
      toast({ title: "Quiz generation failed", description: "Check your server connection.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!selected || !current || !quiz) return;
    setIsAnswered(true);
    const timeMs = Date.now() - questionStart;
    const newAnswers = [...answers, { questionId: current.id, answer: selected, timeMs }];
    setAnswers(newAnswers);

    await new Promise(r => setTimeout(r, 1100));

    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected("");
      setIsAnswered(false);
      setQuestionStart(Date.now());
    } else {
      // Submit
      try {
        const r = await fetch(apiUrl("/api/quiz/submit"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId: quiz.id, answers: newAnswers }),
        });
        if (r.ok) setResult(await r.json());
      } catch {}
      setState("completed");
    }
  };

  const optionClass = (opt: string) => {
    if (!isAnswered) {
      return selected === opt
        ? "option-selected border-primary"
        : "border-border hover:border-primary/40 hover:bg-muted/30 cursor-pointer";
    }
    if (opt === current?.answer) return "option-correct";
    if (opt === selected) return "option-wrong";
    return "opacity-40";
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // INTRO STATE
  if (state === "intro") {
    return (
      <AppLayout title="Quiz">
        <div className="flex items-center justify-center min-h-[80vh] p-6">
          <div className="w-full max-w-md animate-fade-in">
            <Card className="glass border-border/50">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-2xl btn-glow flex items-center justify-center mx-auto mb-5 shadow-xl">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-center mb-2">Generate a Quiz</h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Enter any topic and Spark.E will create a 10-question adaptive quiz powered by AI.
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="e.g. Python recursion, DBMS normalization…"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && generateQuiz()}
                    className="glass border-border/50 focus:border-primary/50"
                  />
                  <Button
                    className="w-full btn-glow text-white border-0 gap-2 h-11"
                    onClick={generateQuiz}
                    disabled={generating}
                  >
                    {generating ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating…</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Generate 10-Question Quiz</>
                    )}
                  </Button>
                </div>
                <div className="mt-5">
                  <p className="text-xs text-muted-foreground mb-3">Quick topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Data Structures", "Calculus", "AI Ethics", "Python", "DBMS", "Operating Systems"].map(t => (
                      <button key={t} onClick={() => setTopic(t)}
                        className="text-xs glass px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // LOADING STATE
  if (state === "loading") {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl avatar-glow flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-bold">Preparing your quiz…</p>
            <p className="text-sm text-muted-foreground mt-1">AI is crafting questions just for you</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // COMPLETED STATE
  if (state === "completed") {
    const pct = result?.percentage ?? 0;
    const grade = result?.grade ?? "F";
    const gs = gradeStyle(grade);
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh] p-6">
          <div className="w-full max-w-lg animate-scale-in">
            <Card className="glass border-border/50">
              <CardContent className="pt-8 pb-8">
                <div className={`w-20 h-20 rounded-full ${gs.bg} flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-4xl">{gs.emoji}</span>
                </div>
                <h2 className="text-3xl font-extrabold text-center mb-1">Quiz Complete!</h2>
                <p className="text-muted-foreground text-center text-sm mb-6">
                  {pct >= 80 ? "Excellent work! You really know this." : pct >= 60 ? "Good effort! A bit more practice and you'll nail it." : "Keep going — every attempt makes you stronger."}
                </p>

                {/* Score display */}
                <div className={`text-center py-5 rounded-2xl ${gs.bg} mb-5`}>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-6xl font-black ${gs.color}`}>{result?.score ?? 0}</span>
                    <span className="text-2xl text-muted-foreground font-bold">/ {result?.total ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className={`text-2xl font-black ${gs.color}`}>{grade}</span>
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-lg font-bold">{pct}%</span>
                  </div>
                </div>

                <Progress value={pct} className="h-2 mb-5" />

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="glass rounded-xl p-3 text-center">
                    <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-lg font-bold">{((result?.avgTimeMs ?? 0) / 1000).toFixed(1)}s</p>
                    <p className="text-xs text-muted-foreground">Avg per question</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <Target className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-lg font-bold">{result?.improvements?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Topics to review</p>
                  </div>
                </div>

                {result?.improvements?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-muted-foreground mb-2">FOCUS AREAS</p>
                    <div className="flex flex-wrap gap-2">
                      {result.improvements.map((imp: any, i: number) => (
                        <Badge key={i} variant="destructive" className="text-xs">{imp.topic} · {imp.count} missed</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result?.advice?.length > 0 && (
                  <div className="glass rounded-xl p-4 mb-5">
                    <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-primary" /> AI Advice</p>
                    <div className="space-y-1">
                      {result.advice.slice(0, 2).map((a: string, i: number) => (
                        <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{a}</ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-1.5" onClick={() => setState("intro")}>
                    <RotateCcw className="w-4 h-4" /> New Quiz
                  </Button>
                  <Button className="flex-1 btn-glow text-white border-0 gap-1.5" onClick={() => navigate("/dashboard")}>
                    Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Per-question breakdown */}
            {result?.details && (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-bold px-1">Question Breakdown</p>
                {result.details.map((d: any, i: number) => (
                  <Card key={i} className={`border ${d.correct ? "border-green-500/25 bg-green-500/4" : "border-red-500/25 bg-red-500/4"}`}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        {d.correct ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        <span className="text-sm font-medium">{d.question}</span>
                      </div>
                      <div className="text-xs text-muted-foreground pl-6">
                        {!d.correct && <span>Your answer: <span className="text-red-500">{d.userAnswer || "—"}</span> · </span>}
                        Correct: <span className="text-green-500">{d.correctAnswer}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6 mt-1">{d.explanation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // IN-PROGRESS STATE
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">{quiz?.topic}</p>
              <p className="text-sm font-bold">Question {currentIdx + 1} / {quiz?.questions.length}</p>
            </div>
            <div className="flex items-center gap-3">
              {current && <Badge className={`text-xs ${diffBadge[current.difficulty]}`}>{current.difficulty}</Badge>}
              <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-mono">{fmt(elapsed)}</span>
              </div>
            </div>
          </div>

          <Progress value={progress} className="h-1.5 mb-5" />

          <Card className="glass border-border/50">
            <CardHeader className="pb-4">
              {current?.topic && <Badge variant="secondary" className="w-fit text-xs mb-2">{current.topic}</Badge>}
              <CardTitle className="text-lg font-bold leading-relaxed">{current?.question}</CardTitle>
            </CardHeader>
            <CardContent>
              {current?.type === "short" ? (
                <Textarea
                  placeholder="Type your answer here…"
                  value={selected}
                  onChange={e => !isAnswered && setSelected(e.target.value)}
                  disabled={isAnswered}
                  className="min-h-[100px] glass border-border/50 focus:border-primary/50"
                />
              ) : (
                <RadioGroup value={selected} onValueChange={v => !isAnswered && setSelected(v)}>
                  <div className="space-y-3">
                    {(current?.options || []).map((opt, i) => (
                      <label
                        key={i}
                        className={`flex items-center gap-3 p-4 border rounded-2xl transition-all ${optionClass(opt)} ${!isAnswered ? "cursor-pointer" : ""}`}
                        htmlFor={`opt-${i}`}
                      >
                        <RadioGroupItem value={opt} id={`opt-${i}`} className="shrink-0" />
                        <span className="text-sm flex-1">{opt}</span>
                        {isAnswered && opt === current?.answer && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                        {isAnswered && opt === selected && opt !== current?.answer && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {isAnswered && current?.explanation && (
                <div className="mt-4 p-3 glass rounded-xl border-border/40 animate-fade-in">
                  <p className="text-xs font-bold text-muted-foreground mb-1">EXPLANATION</p>
                  <p className="text-sm">{current.explanation}</p>
                </div>
              )}

              <Button
                className="w-full mt-5 btn-glow text-white border-0 h-11 gap-2"
                onClick={submitAnswer}
                disabled={!selected || isAnswered}
              >
                {isAnswered
                  ? currentIdx < (quiz?.questions.length ?? 0) - 1 ? "Next Question →" : "See Results →"
                  : "Submit Answer"}
              </Button>
            </CardContent>
          </Card>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-5 flex-wrap">
            {quiz?.questions.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < currentIdx ? "w-3 h-3 bg-primary" :
                  i === currentIdx ? "w-4 h-4 bg-primary/70 scale-110" :
                  "w-2.5 h-2.5 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Quiz;
