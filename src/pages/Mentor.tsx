import { apiUrl, supabase } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Plus, FileText, Bot, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useState, FormEvent, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

interface Message {
  text: string;
  sender: "user" | "ai";
  sources?: string[];
}

const Mentor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [materials, setMaterials] = useState([
    { name: "Data Structures.pdf", pages: 80 },
    { name: "Algorithm Notes", pages: 45 },
    { name: "Python Basics", pages: 32 },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hello! I'm your AI Mentor. Upload study materials and ask me anything about them. I'll give you personalized explanations tailored to your level." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);
  const [persona, setPersona] = useState("Friendly");
  const [stylePref, setStylePref] = useState("Auto");
  const [tutorId] = useState<string>(() => {
    const existing = localStorage.getItem("le_tutor_id");
    if (existing) return existing;
    const id = `tutor_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem("le_tutor_id", id);
    return id;
  });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!supabase) {
      toast({ title: "Storage not configured", description: "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.", variant: "destructive" });
      return;
    }
    try {
      const filePath = `mentor-materials/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("uploads").upload(filePath, file, { upsert: true });
      if (error) throw error;
      setMaterials(prev => [...prev, { name: file.name, pages: 0 }]);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(apiUrl("/api/upload"), { method: "POST", body: form });
        if (res.ok) {
          const js = await res.json();
          setUploadedIds(prev => [...prev, js.id]);
        }
      } catch {}
      toast({ title: "Material uploaded!", description: `${file.name} is now available to your mentor.` });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    const userMessage: Message = { text: userInput, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput("");
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/api/messages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentInput,
          fileIds: uploadedIds,
          source: "mentor",
          chatId: tutorId,
          persona,
          style: stylePref,
        }),
      });
      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      const aiMessage: Message = {
        sender: "ai",
        text: data.text || "I couldn't generate a response. Please try again.",
        sources: data.sources,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast({ title: "Failed to get response", description: error.message, variant: "destructive" });
      setMessages(prev => [...prev, { sender: "ai", text: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMaterial = (name: string) => {
    setMaterials(prev => prev.filter(m => m.name !== name));
  };

  const sidebar = (
    <div className="w-72 border-r border-border/40 bg-card/30 backdrop-blur-sm flex flex-col shrink-0">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Tutor</h2>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Teaching style</p>
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Friendly", "Strict", "Socratic", "Motivational"].map(p => (
                  <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Explanation style</p>
            <Select value={stylePref} onValueChange={setStylePref}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Auto", "Visual", "Step-by-step", "Examples only", "Concise"].map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground">MATERIALS ({materials.length})</p>
          <label htmlFor="mentor-file-upload" className="cursor-pointer">
            <Button size="sm" variant="ghost" asChild className="h-6 w-6 p-0">
              <span><Plus className="w-3.5 h-3.5" /></span>
            </Button>
          </label>
          <input type="file" className="hidden" id="mentor-file-upload" onChange={handleFileChange} accept=".pdf,.txt,.md,.doc,.docx" />
        </div>
        <div className="space-y-2">
          {materials.map((material, index) => (
            <div key={index} className="flex items-center justify-between p-2.5 rounded-xl glass group">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{material.name}</p>
                  {material.pages > 0 && <p className="text-xs text-muted-foreground">{material.pages} pages</p>}
                </div>
              </div>
              <button
                onClick={() => removeMaterial(material.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border/40">
        <Button
          className="w-full"
          size="sm"
          variant="outline"
          onClick={() => navigate("/quiz")}
        >
          Generate Quiz from Materials
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        <div className="hidden lg:block">{sidebar}</div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-5">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-primary to-accent text-white"
                        : "glass prose prose-sm dark:prose-invert"
                    }`}
                  >
                    {msg.sender === "ai" ? (
                      <>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="not-prose mt-2 flex flex-wrap gap-1">
                            {msg.sources.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.sender === "user" && (
                    <Avatar className="w-8 h-8 ml-2 mt-1 shrink-0">
                      <AvatarImage src="/avatars/user.png" alt="User" />
                      <AvatarFallback className="text-xs bg-primary/20">U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="glass rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border/40 bg-background/60 backdrop-blur-sm p-4">
            <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  placeholder="Ask your AI Tutor anything..."
                  className="glass rounded-2xl pr-12 h-12 text-sm"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary text-white rounded-xl"
                  size="icon"
                  disabled={isLoading || !userInput.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Mentor;
