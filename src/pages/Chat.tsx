import { apiUrl, supabase } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Plus, Trash2, FileText, Zap, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChangeEvent, useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

interface ChatEntry { user: string; text: string; kind?: string; sources?: string[]; }
interface UploadedFile { id: string; name: string; url: string; chunks: number; }

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark', fontFamily: 'Inter' });
    mermaid.render(`mermaid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, chart).then((res) => {
      setSvg(res.svg);
    }).catch((e) => console.error('Mermaid render error:', e));
  }, [chart]);
  return <div className="mermaid-wrapper my-4 flex justify-center bg-card/40 p-4 rounded-xl border border-border/50" dangerouslySetInnerHTML={{ __html: svg }} />;
};

const PROMPTS = [
  { emoji: "🔬", text: "Explain photosynthesis step by step" },
  { emoji: "🧮", text: "Walk me through calculus integration" },
  { emoji: "💡", text: "What is recursion with examples?" },
  { emoji: "📊", text: "Compare supervised vs unsupervised learning" },
];

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem("le_uploaded_files");
    return saved ? JSON.parse(saved) : [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [chatId] = useState<string>(() => {
    const existing = localStorage.getItem("le_chat_id");
    if (existing) return existing;
    const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem("le_chat_id", id);
    return id;
  });
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isLoading]);

  // Load history for this chatId
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(apiUrl(`/api/messages?chatId=${chatId}`));
        if (r.ok) setChatHistory(await r.json());
      } catch {}
    };
    load();
  }, [chatId]);

  // Persist uploaded files to localStorage
  useEffect(() => {
    localStorage.setItem("le_uploaded_files", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  // Handle ?q= param from Dashboard
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q");
    if (q?.trim()) {
      setMessage(q);
      // small delay to let component mount
      setTimeout(() => sendMessage(q), 100);
    }
  }, []);

  const sendMessage = useCallback(async (content?: string) => {
    const msg = (content ?? message).trim();
    if (!msg || isLoading) return;
    setMessage("");
    setIsLoading(true);
    // Optimistic user message
    setChatHistory(h => [...h, { user: msg, text: "", kind: "pending" }]);
    try {
      const r = await fetch(apiUrl("/api/messages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: msg, fileIds: uploadedFiles.map(f => f.id), chatId, source: "chat" }),
      });
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      setChatHistory(h => [...h.slice(0, -1), { user: msg, text: data.text, kind: "answer", sources: data.sources }]);
    } catch {
      setChatHistory(h => [...h.slice(0, -1), { user: msg, text: "Sorry, I had trouble responding. Please try again.", kind: "error" }]);
      toast({ title: "Connection error", description: "Could not reach the AI. Check your server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [message, isLoading, uploadedFiles, chatId]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch(apiUrl("/api/upload"), { method: "POST", body: form });
      if (!r.ok) throw new Error("Upload failed");
      const data = await r.json();
      setUploadedFiles(f => [...f, { id: data.id, name: file.name, url: data.url, chunks: data.chunks || 0 }]);
      toast({ title: `"${file.name}" uploaded`, description: data.hasText ? `${data.chunks} chunks indexed for AI` : "File saved (no text extracted)" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = (id: string) => setUploadedFiles(f => f.filter(x => x.id !== id));

  const clearChat = () => {
    const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem("le_chat_id", id);
    setChatHistory([]);
    setUploadedFiles([]); // Also clear files on new chat
    toast({ title: "New chat started" });
  };

  const handleGenerateQuiz = async () => {
    const topic = chatHistory.slice(-1)[0]?.user || message;
    if (!topic.trim()) { toast({ title: "Ask a question first to generate a quiz", variant: "destructive" }); return; }
    try {
      const r = await fetch(apiUrl("/api/quiz/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, fileIds: uploadedFiles.map(f => f.id) }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      navigate(`/quiz?quizId=${d.id}`);
    } catch { toast({ title: "Quiz generation failed", variant: "destructive" }); }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-6 h-14 border-b border-border/40 shrink-0 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold">Spark.E</span>
              <Badge variant="secondary" className="text-xs">AI Mentor</Badge>
            </div>
            <div className="flex items-center gap-2">
              {uploadedFiles.length > 0 && (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} active
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground" onClick={clearChat}>
                <Trash2 className="w-3.5 h-3.5" /> New Chat
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-12 animate-fade-in">
                  <div className="w-20 h-20 rounded-2xl avatar-glow flex items-center justify-center mb-5 shadow-lg">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Hi, I'm Spark.E</h1>
                  <p className="text-muted-foreground text-sm mb-8 max-w-xs">
                    Your AI learning companion. Ask me anything, upload your notes, or start a quiz.
                  </p>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    {PROMPTS.map((p) => (
                      <button
                        key={p.text}
                        onClick={() => sendMessage(p.text)}
                        className="glass p-3.5 rounded-2xl text-left text-sm hover:border-primary/40 transition-all hover:-translate-y-0.5 hover:shadow-md group"
                      >
                        <span className="text-base mr-2">{p.emoji}</span>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{p.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((entry, i) => (
                  <div key={i} className="space-y-3 animate-fade-in">
                    {/* User bubble */}
                    <div className="flex justify-end">
                      <div className="chat-bubble-user px-4 py-2.5 max-w-[78%] text-sm shadow-md">
                        {entry.user}
                      </div>
                    </div>
                    {/* AI bubble */}
                    {entry.kind === "pending" ? (
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-xl avatar-glow flex items-center justify-center shrink-0 text-sm">✨</div>
                        <div className="chat-bubble-ai px-4 py-3">
                          <div className="flex gap-1.5 items-center">
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                          </div>
                        </div>
                      </div>
                    ) : entry.text ? (
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-xl avatar-glow flex items-center justify-center shrink-0 text-sm">✨</div>
                        <div className="chat-bubble-ai px-4 py-3 max-w-[82%]">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  if (!inline && match && match[1] === 'mermaid') {
                                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                  }
                                  return <code className={className} {...props}>{children}</code>;
                                }
                              }}
                            >
                              {entry.text}
                            </ReactMarkdown>
                          </div>
                          {entry.sources?.length ? (
                            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/30">
                              <span className="text-xs text-muted-foreground">Sources:</span>
                              {entry.sources.map((s, si) => (
                                <Badge key={si} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Active files strip */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 pb-2 flex gap-2 flex-wrap">
              {uploadedFiles.map(f => (
                <div key={f.id} className="flex items-center gap-1.5 glass rounded-lg px-2 py-1 text-xs">
                  <FileText className="w-3 h-3 text-primary shrink-0" />
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  {f.chunks > 0 && <Badge variant="secondary" className="text-[10px] px-1 h-4">{f.chunks}c</Badge>}
                  <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-destructive ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="px-4 pb-4 pt-2 bg-background/60 backdrop-blur-sm border-t border-border/30">
            <div className="max-w-2xl mx-auto">
              <div className="glass rounded-2xl flex items-center gap-2 px-3 py-2 focus-within:border-primary/50 transition-colors">
                <label htmlFor="chat-file" className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50">
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </label>
                <input id="chat-file" type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg" />
                <Input
                  ref={inputRef}
                  placeholder="Ask Spark.E anything..."
                  className="border-0 shadow-none bg-transparent focus-visible:ring-0 px-0 flex-1 text-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !message.trim()}
                  className="btn-glow h-8 w-8 rounded-xl text-white border-0 shrink-0"
                  size="icon"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[11px] text-muted-foreground">Enter to send · Shift+Enter for new line</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-primary"
                  onClick={handleGenerateQuiz}
                >
                  <Zap className="w-3 h-3" /> Generate Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — files + actions */}
        <div className="hidden xl:flex w-56 border-l border-border/40 flex-col bg-card/30 backdrop-blur-sm shrink-0">
          <div className="p-4 border-b border-border/40">
            <p className="text-xs font-bold text-muted-foreground tracking-widest mb-3">MATERIALS</p>
            <label htmlFor="side-file-upload" className="block cursor-pointer">
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 hover:border-primary/40 transition-all text-sm text-muted-foreground hover:text-foreground">
                <Plus className="w-4 h-4 shrink-0" />
                <span className="text-xs">Add file</span>
              </div>
            </label>
            <input id="side-file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.md,.doc,.docx" />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
            {uploadedFiles.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 px-2">Upload PDFs or notes to give Spark.E context</p>
            ) : (
              uploadedFiles.map(f => (
                <div key={f.id} className="glass rounded-xl p-2.5 group">
                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{f.chunks} chunks indexed</p>
                    </div>
                    <button onClick={() => removeFile(f.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-border/40 space-y-2">
            <Button onClick={handleGenerateQuiz} variant="outline" size="sm" className="w-full text-xs gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Generate Quiz
            </Button>
            <Button onClick={clearChat} variant="ghost" size="sm" className="w-full text-xs gap-1.5 text-muted-foreground">
              <Trash2 className="w-3.5 h-3.5" /> New Chat
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
