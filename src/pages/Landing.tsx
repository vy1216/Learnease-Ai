import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Star, Sparkles, Brain, MessageSquare, Zap, GitBranch, Users, Trophy, Upload, Play } from "lucide-react";

const FEATURES = [
  { icon: MessageSquare, title: "AI Chat Mentor", desc: "Ask anything in plain language. Get structured, personalized explanations with examples, diagrams, and quizzes — all powered by Groq's LLaMA 3.3.", color: "from-violet-500 to-purple-600" },
  { icon: Upload, title: "Upload & Learn", desc: "Drop your PDFs, notes, or textbooks. Spark.E indexes every page and answers questions directly from your material.", color: "from-blue-500 to-cyan-600" },
  { icon: Zap, title: "Adaptive Quizzes", desc: "AI generates 10-question quizzes tuned to your weak spots. Get grades, explanations, and improvement advice instantly.", color: "from-amber-500 to-orange-600" },
  { icon: GitBranch, title: "Skill Trees", desc: "Visual progress maps per subject. See what you know, what's next, and get AI-recommended next steps.", color: "from-emerald-500 to-green-600" },
  { icon: Users, title: "Study Circles", desc: "Join live study groups with peers on the same topics. Ask questions, share resources, and stay accountable.", color: "from-pink-500 to-rose-600" },
  { icon: Trophy, title: "XP & Leaderboard", desc: "Earn XP for every chat, quiz, and upload. Compete with peers on the global leaderboard and maintain your streak.", color: "from-indigo-500 to-violet-600" },
];

const PRICING = [
  { name: "Free", price: "₹0", period: "forever", desc: "Get started today", features: ["5 AI questions / day", "2 file uploads", "Basic quiz (5 questions)", "Community access", "Progress tracking"], cta: "Start Free", highlight: false },
  { name: "Pro", price: "₹499", period: "/ month", desc: "For serious learners", features: ["Unlimited AI questions", "Unlimited uploads", "10-question AI quizzes", "Full skill tree", "Priority support", "XP & leaderboard"], cta: "Start Pro →", highlight: true },
  { name: "Team", price: "₹1,499", period: "/ month", desc: "For groups & institutions", features: ["Everything in Pro", "Up to 10 members", "Shared materials library", "Group leaderboard", "Admin dashboard", "Custom AI persona"], cta: "Contact Us", highlight: false },
];

const REVIEWS = [
  { name: "Arjun K.", role: "B.Tech CSE · NIT Trichy", text: "I uploaded my semester notes and asked Spark.E to quiz me. Got 85% in my exam when I was expecting 60. Insane tool.", stars: 5 },
  { name: "Priya S.", role: "NEET 2025 Aspirant", text: "The AI doesn't just give generic answers — it actually reads MY notes and explains based on what I've uploaded. That's the difference.", stars: 5 },
  { name: "Rahul V.", role: "CA Final Student", text: "Quiz generation is scary good. It picks exactly the topics I'm weak at. My mock test scores jumped 20 points in 3 weeks.", stars: 5 },
];

const Landing = () => (
  <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
    {/* Nav */}
    <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl btn-glow flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-gradient">LearnEase</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {["features", "pricing", "reviews"].map(s => (
            <a key={s} href={`#${s}`} className="capitalize hover:text-foreground transition-colors">{s}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button size="sm" className="btn-glow text-white border-0">Get started free</Button></Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative pt-32 pb-24 px-6 aura overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Badge className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 font-semibold text-xs animate-fade-in">
          <Sparkles className="w-3 h-3 mr-1.5 inline" /> Powered by Groq · LLaMA 3.3 · RAG
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] animate-slide-up">
          The AI mentor that<br />
          <span className="hero-text">reads your notes</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up delay-75">
          Upload your textbooks and notes. Ask Spark.E anything. Get personalized explanations, adaptive quizzes, and a full skill tree — built for students who want results.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-150">
          <Link to="/auth">
            <Button size="lg" className="btn-glow text-white border-0 px-8 h-12 text-base gap-2">
              Start learning free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="px-8 h-12 text-base gap-2 glass">
              <Play className="w-4 h-4" /> View demo
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-5 animate-fade-in delay-225">No credit card · Free plan · 2,000+ students</p>

        {/* Hero stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-14 animate-fade-in delay-300">
          {[["2,000+", "Students"], ["94%", "Pass rate"], ["50K+", "Questions answered"]].map(([v, l]) => (
            <div key={l} className="glass rounded-2xl py-5">
              <div className="text-2xl md:text-3xl font-extrabold text-gradient mb-1">{v}</div>
              <div className="text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/8 text-primary border-primary/15 font-semibold text-xs">Everything you need</Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Built for how students actually learn</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Not another generic AI chatbot. LearnEase is purpose-built for studying — with RAG, quizzes, progress tracking, and community.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Card key={f.title} className={`glass border-border/50 card-hover animate-fade-in delay-${i * 75}`}>
              <CardContent className="pt-6 pb-5">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <Badge className="mb-4 bg-accent/8 text-accent border-accent/15 font-semibold text-xs">How it works</Badge>
        <h2 className="text-4xl font-extrabold tracking-tight mb-16">From notes to mastery in 3 steps</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", icon: Upload, title: "Upload your notes", desc: "Drag in any PDF, textbook, or document. Spark.E reads and indexes every page instantly.", color: "from-blue-500 to-cyan-500" },
            { step: "02", icon: Brain, title: "Chat & learn", desc: "Ask questions in plain language. Get explanations tailored to your level, with examples from your own materials.", color: "from-violet-500 to-purple-500" },
            { step: "03", icon: Zap, title: "Quiz & level up", desc: "Test yourself with AI-generated quizzes. Track weak spots, earn XP, and watch your skill tree grow.", color: "from-amber-500 to-orange-500" },
          ].map(({ step, icon: Icon, title, desc, color }) => (
            <div key={step} className="relative">
              <div className="text-6xl font-black text-foreground/5 mb-2 select-none">{step}</div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing */}
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-500/8 text-green-600 border-green-500/15 font-semibold text-xs">Pricing</Badge>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">Honest pricing, no surprises</h2>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.highlight ? "border-primary ring-2 ring-primary/20 shadow-2xl shadow-primary/10" : "glass border-border/50"}`}>
              {plan.highlight && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <div className="btn-glow text-white text-[11px] font-bold px-4 py-1 rounded-full">MOST POPULAR</div>
                </div>
              )}
              <CardContent className="pt-8 pb-7">
                <h3 className="font-extrabold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className={`w-full ${plan.highlight ? "btn-glow text-white border-0" : ""}`} variant={plan.highlight ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Reviews */}
    <section id="reviews" className="py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-500/8 text-yellow-600 border-yellow-500/15 font-semibold text-xs">Reviews</Badge>
          <h2 className="text-4xl font-extrabold tracking-tight">Students don't lie</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <Card key={r.name} className="glass border-border/50 card-hover">
              <CardContent className="pt-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-foreground/80">"{r.text}"</p>
                <div>
                  <p className="text-sm font-bold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-3xl p-12 border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 aura opacity-50 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl btn-glow flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-4">Ready to learn smarter?</h2>
            <p className="text-muted-foreground mb-8">Upload your first document and ask Spark.E a question in under 2 minutes.</p>
            <Link to="/auth">
              <Button size="lg" className="btn-glow text-white border-0 px-10 h-12 text-base gap-2">
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border/30 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg btn-glow flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-sm text-gradient">LearnEase</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 LearnEase. Built for students who mean business.</p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <Link to="/help" className="hover:text-foreground">Support</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
