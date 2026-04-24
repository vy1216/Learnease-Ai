import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'learnease-dev-secret-change-in-production';

// ── SUPABASE ───────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = new Set([
  process.env.PUBLIC_FRONTEND_URL || 'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:3000',
  'https://v4learnease.vercel.app',
  'https://learnease-ai-ten.vercel.app',
]);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.has(origin) || origin.endsWith('.vercel.app')) {
      cb(null, true);
    } else {
      cb(new Error('CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());
app.use(bodyParser.json({ limit: '10mb' }));

// ── FILE STORAGE ───────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage, limits: { fileSize: 20 * 1024 * 1024 } });

// ── GROQ AI ────────────────────────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  extra: { role: 'system' | 'user'; content: string }[] = [],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  if (!groq) throw new Error('GROQ_API_KEY not set');
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...extra,
    { role: 'user', content: userPrompt },
  ];
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048,
  });
  return completion.choices[0]?.message?.content || '';
}

// ── AUTH MIDDLEWARE ────────────────────────────────────────────────────────────
function authenticateToken(req: any, res: any, next: any) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function getUserFromToken(req: any): any | null {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

async function addXp(userId: string, amount: number) {
  const { data } = await supabase.from('users').select('xp').eq('id', userId).single();
  if (data) {
    await supabase.from('users').update({ xp: data.xp + amount }).eq('id', userId);
  }
}

// ── UTILS ──────────────────────────────────────────────────────────────────────
function makeId(prefix = 'id') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

function getGrade(pct: number) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

function extractRelevantContext(query: string, docs: any[]): string {
  if (!docs.length) return '';
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  let out = '';
  
  for (const doc of docs) {
    const docText = doc.text || '';
    const baselineText = docText.slice(0, 2500).trim();
    if (baselineText) {
      out += `\n\n[From (Beginning of Document): ${doc.name}]\n${baselineText}`;
    }
  }

  const allSentences: { text: string; score: number; source: string }[] = [];
  for (const doc of docs) {
    const docText = doc.text || '';
    const sentences = docText.split(/[.!?\n]+/).filter((s: string) => s.trim().length > 20);
    for (const s of sentences) {
      const lower = s.toLowerCase();
      const score = queryWords.reduce((acc, w) => acc + (lower.includes(w) ? 2 : 0), 0);
      if (score > 0) allSentences.push({ text: s.trim(), score, source: doc.name });
    }
  }
  allSentences.sort((a, b) => b.score - a.score);
  const top = allSentences.slice(0, 8);
  
  if (top.length > 0) {
    const bySource = new Map<string, string[]>();
    for (const s of top) {
      if (!bySource.has(s.source)) bySource.set(s.source, []);
      bySource.get(s.source)!.push(s.text);
    }
    for (const [src, sentences] of bySource) {
      out += `\n\n[From (Relevant Excerpts): ${src}]\n${sentences.join(' ')}`;
    }
  }
  
  return out.slice(0, 12000);
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
app.get('/', (_, res) => res.json({ message: 'LearnEase API', version: '2.0.0', status: 'ok', ai: !!groq }));

// ── AUTH ───────────────────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  
  const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase().trim()).single();
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  
  const hashed = await bcrypt.hash(password, 10);
  const { error } = await supabase.from('users').insert({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: hashed
  });
  
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
  res.status(201).json({ message: 'Account created. Please sign in.' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('email', email?.toLowerCase().trim()).single();
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
  
  const now = new Date();
  const last = new Date(user.last_active);
  const daysDiff = Math.floor((now.getTime() - last.getTime()) / 86400000);
  let streak = user.streak;
  if (daysDiff === 1) streak += 1;
  else if (daysDiff > 1) streak = 1;
  
  await supabase.from('users').update({ streak, last_active: now.toISOString() }).eq('id', user.id);
  
  const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, xp: user.xp, streak } });
});

app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false });
  try { jwt.verify(token, JWT_SECRET); res.json({ valid: true }); }
  catch { res.status(401).json({ valid: false }); }
});

app.get('/api/me', authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user.userId).single();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, username: user.username, xp: user.xp, streak: user.streak, createdAt: user.created_at });
});

// ── CHAT ───────────────────────────────────────────────────────────────────────
app.get('/api/messages', async (req, res) => {
  const chatId = String(req.query.chatId || '');
  if (!chatId) return res.json([]);
  
  const { data: msgs } = await supabase.from('chat_messages').select('*').eq('chat_id', chatId).order('timestamp', { ascending: true });
  if (!msgs) return res.json([]);
  
  const pairs: { user: string; text: string; kind: string; sources?: string[] }[] = [];
  for (let i = 0; i < msgs.length; i += 2) {
    const userMsg = msgs[i];
    const aiMsg = msgs[i + 1];
    if (userMsg && aiMsg) {
      pairs.push({ user: userMsg.content, text: aiMsg.content, kind: 'answer', sources: aiMsg.sources });
    }
  }
  res.json(pairs);
});

app.post('/api/messages', async (req, res) => {
  const { user: userText, fileIds, chatId } = req.body;
  if (!userText?.trim()) return res.status(400).json({ error: 'Message text required' });

  const cid = chatId || makeId('chat');

  // Store user message
  await supabase.from('chat_messages').insert({ chat_id: cid, role: 'user', content: userText.trim() });

  // Fetch full history
  const { data: historyData } = await supabase.from('chat_messages').select('*').eq('chat_id', cid).order('timestamp', { ascending: true });
  const history = historyData || [];

  // Gather document context
  let docs: any[] = [];
  if (fileIds && fileIds.length > 0) {
    const { data } = await supabase.from('uploaded_docs').select('*').in('id', fileIds);
    if (data) docs = data;
  }
  const context = extractRelevantContext(userText, docs);

  // Build conversation history for AI (last 20 turns)
  const recentHistory = history.slice(-20);
  const conversationMsgs = recentHistory.slice(0, -1).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const SYSTEM = `You are Spark.E, the AI mentor for LearnEase — a smart, warm, and highly knowledgeable learning assistant.

CRITICAL INSTRUCTIONS:
- YOU HAVE FULL ACCESS TO UPLOADED FILES. The contents are provided below in the DOCUMENT CONTEXT.
- NEVER say "I am an AI and cannot read files" or similar. You CAN read them via the context provided.
- If asked to summarize, analyze, or explain an uploaded document, rely heavily on the DOCUMENT CONTEXT below.
- If the user asks for a heat map, graph, flow chart, or summary graph, you MUST output valid Mermaid.js code blocks (using \`\`\`mermaid). Create highly impactful, dynamic visual diagrams using Mermaid syntax (like pie charts, mindmaps, graph TD, sequenceDiagram, etc.) that represent the requested data clean and steadily.
- Give clear, well-structured answers using markdown (headers, bullets, bold text).
- Use an encouraging, friendly tone.

${context ? `DOCUMENT CONTEXT (from student's uploaded materials):\n${context}\n\nCite these materials when answering.` : 'No documents uploaded yet.'}`;

  let aiText = '';
  let sources: string[] = [];

  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          ...conversationMsgs,
          { role: 'user', content: userText },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });
      aiText = completion.choices[0]?.message?.content || 'I had trouble generating a response. Please try again.';
      if (context && docs.length) sources = docs.map(d => d.name);
    } catch (err: any) {
      console.error('Groq error:', err.message);
      aiText = `I'm having trouble connecting to the AI right now. Here's what I know about your question:\n\n${context ? `From your materials:\n${context.slice(0, 500)}...` : 'Please check your internet connection or try again in a moment.'}`;
    }
  } else {
    aiText = context
      ? `Based on your uploaded materials:\n\n${context.slice(0, 800)}\n\n*Set GROQ_API_KEY in server/.env for full AI responses.*`
      : `**Note:** No AI key configured.\n\nTo get full AI-powered answers, add your GROQ_API_KEY to \`server/.env\`.\n\nYou can get a free key at [console.groq.com](https://console.groq.com).`;
  }

  await supabase.from('chat_messages').insert({ chat_id: cid, role: 'assistant', content: aiText, sources: sources.length ? sources : null });

  // Update user XP
  const currentUser = getUserFromToken(req);
  if (currentUser) {
    await addXp(currentUser.userId, 2);
  }

  res.status(201).json({ user: userText, text: aiText, kind: 'answer', sources: sources.length ? sources : undefined, chatId: cid });
});

// ── UPLOAD ─────────────────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  
  const fileExt = req.file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('uploads')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false
    });

  if (storageError) {
    console.error('Supabase storage upload error:', storageError);
    return res.status(500).json({ error: 'Storage upload failed: ' + storageError.message });
  }

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  const fileUrl = publicUrlData.publicUrl;

  let text = '';
  const mime = req.file.mimetype;
  const buf = req.file.buffer;

  try {
    if (mime.includes('pdf')) {
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(buf);
      text = parsed.text || '';
      if (!text.trim()) {
        try {
          const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
          const { createCanvas } = require('canvas');
          const Tesseract = require('tesseract.js');
          const data = new Uint8Array(buf);
          const pdf = await pdfjsLib.getDocument({ data }).promise;
          const limit = Math.min(pdf.numPages, 5);
          for (let i = 1; i <= limit; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = createCanvas(viewport.width, viewport.height);
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            const r = await Tesseract.recognize(canvas.toBuffer('image/png'), 'eng');
            text += '\n' + (r?.data?.text || '');
            if (text.length > 15000) break;
          }
        } catch (e) { console.error('OCR failed:', e); }
      }
    } else if (mime.startsWith('text/') || mime.includes('json')) {
      text = buf.toString('utf-8');
    } else if (mime.startsWith('image/')) {
      try {
        const Tesseract = require('tesseract.js');
        const r = await Tesseract.recognize(buf, 'eng');
        text = r?.data?.text || '';
      } catch { }
    }
  } catch (e) { console.error('Parse error:', e); }

  if (text.length > 20000) text = text.slice(0, 20000);
  text = text.replace(/\s{3,}/g, '\n').trim();

  const { data, error } = await supabase.from('uploaded_docs').insert({
    name: req.file.originalname,
    url: fileUrl,
    text
  }).select('id').single();

  if (error) {
    console.error('Supabase insert error for uploaded_docs:', error);
    return res.status(500).json({ error: 'Database error: ' + error.message });
  }

  const chunks = text ? Math.ceil(text.length / 500) : 0;
  res.json({ id: data?.id, url: fileUrl, name: req.file.originalname, chunks, hasText: text.length > 0, size: req.file.size });
});

// ── MATERIALS (community library) ─────────────────────────────────────────────
app.get('/api/materials', async (_, res) => {
  const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
  res.json(data || []);
});

app.post('/api/materials', authenticateToken, upload.single('file'), async (req: any, res) => {
  const { name, description } = req.body;
  const file = req.file;
  if (!name || !file) return res.status(400).json({ error: 'Name and file required' });

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('uploads')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (storageError) {
    console.error('Supabase storage upload error:', storageError);
    return res.status(500).json({ error: 'Storage upload failed: ' + storageError.message });
  }

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  const fileUrl = publicUrlData.publicUrl;

  let text = '';
  try {
    const mime = file.mimetype;
    if (mime.includes('pdf')) {
      const pdfParse = require('pdf-parse');
      text = (await pdfParse(file.buffer)).text || '';
    } else if (mime.startsWith('text/')) {
      text = file.buffer.toString('utf-8');
    }
    if (text.length > 20000) text = text.slice(0, 20000);
  } catch { }

  const chunks = Math.ceil(text.length / 500);

  const { data: mat, error: matErr } = await supabase.from('materials').insert({
    name,
    description: description || '',
    file_url: fileUrl,
    uploader_id: req.user.userId,
    chunks,
    size: file.size
  }).select('*').single();

  if (matErr) {
    console.error('Supabase insert error for materials:', matErr);
    return res.status(500).json({ error: 'Database error: ' + matErr.message });
  }

  // Also index for AI use
  await supabase.from('uploaded_docs').insert({
    name: file.originalname,
    url: fileUrl,
    text
  });

  await addXp(req.user.userId, 10);
  res.status(201).json({ ...mat, file_url: mat?.file_url });
});

// ── QUIZ ───────────────────────────────────────────────────────────────────────
async function generateQuizWithAI(topic: string, contextDocs: any[] = []): Promise<any> {
  const context = extractRelevantContext(topic, contextDocs);

  if (groq) {
    try {
      const SYSTEM = `You are a quiz generator. Output ONLY valid JSON. No markdown fences, no extra text.`;
      const prompt = `Generate a 10-question quiz about: "${topic}"
${context ? `\nBase questions on this material:\n${context.slice(0, 3000)}` : ''}

Return JSON in this exact format:
{
  "questions": [
    {
      "type": "mcq",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "Why A is correct...",
      "topic": "${topic}",
      "difficulty": "easy"
    }
  ]
}

Rules:
- Mix types: 5 mcq, 3 tf, 2 short
- For tf: options must be ["True", "False"]
- For short: no options field
- difficulty: first 4 = easy, next 4 = medium, last 2 = hard
- explanation must be 1-2 sentences explaining the correct answer
- All questions must be factually correct`;

      const raw = await callGroq(SYSTEM, prompt, [], { temperature: 0.3, maxTokens: 3000 });
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      const parsed = JSON.parse(raw.slice(start, end + 1));
      const qs = Array.isArray(parsed?.questions) ? parsed.questions : [];
      if (qs.length >= 8) {
        const questions = qs.slice(0, 10).map((q: any, i: number) => ({
          id: `q${i + 1}`,
          type: q.type as any || 'mcq',
          question: String(q.question || ''),
          options: Array.isArray(q.options) ? q.options.map(String) : undefined,
          answer: String(q.answer || ''),
          explanation: String(q.explanation || `The correct answer for this ${topic} question.`),
          topic: String(q.topic || topic),
          difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : (i < 4 ? 'easy' : i < 8 ? 'medium' : 'hard'),
        }));
        
        const { data: quiz } = await supabase.from('quizzes').insert({
          topic,
          questions
        }).select('*').single();
        return quiz;
      }
    } catch (e) { console.error('AI quiz gen failed:', e); }
  }

  // Fallback
  return buildFallbackQuiz(topic);
}

async function buildFallbackQuiz(topic: string): Promise<any> {
  const questions = [
    { id: `q1`, type: 'mcq', question: `What is the primary purpose of ${topic}?`, options: [`To understand and apply ${topic}`, `To ignore ${topic}`, `To misuse ${topic}`, `None of the above`], answer: `To understand and apply ${topic}`, explanation: `The primary purpose of ${topic} is to understand and correctly apply its principles.`, topic, difficulty: 'easy' },
    { id: `q2`, type: 'tf', question: `${topic} is a fundamental concept in its field.`, options: ['True', 'False'], answer: 'True', explanation: `${topic} is indeed considered fundamental in its domain.`, topic, difficulty: 'easy' },
  ];
  const { data: quiz } = await supabase.from('quizzes').insert({ topic, questions }).select('*').single();
  return quiz;
}

app.post('/api/quiz/generate', async (req, res) => {
  const { topic, history, fileIds } = req.body || {};
  let base = (topic && String(topic).trim()) || '';
  if (!base && Array.isArray(history) && history.length) {
    const last = [...history].reverse().find((m: any) => m.user);
    base = String(last?.user || '').slice(0, 100).trim();
  }
  if (!base) base = 'General Knowledge';
  
  let docs: any[] = [];
  if (fileIds && fileIds.length > 0) {
    const { data } = await supabase.from('uploaded_docs').select('*').in('id', fileIds);
    if (data) docs = data;
  }
  
  try {
    const quiz = await generateQuizWithAI(base, docs);
    res.status(201).json({ id: quiz.id, topic: quiz.topic, questionCount: quiz.questions.length });
  } catch {
    res.status(500).json({ error: 'Quiz generation failed' });
  }
});

app.get('/api/quiz/:id', async (req, res) => {
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', req.params.id).single();
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

app.get('/api/quizzes', async (_, res) => {
  const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false }).limit(20);
  res.json(data || []);
});

app.post('/api/quiz/submit', async (req, res) => {
  const { quizId, answers } = req.body || {};
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
  if (!quiz || !Array.isArray(answers)) return res.status(400).json({ error: 'Invalid payload' });

  let score = 0;
  const wrongTopics: Record<string, number> = {};
  let totalTime = 0;
  const details: any[] = [];

  for (const a of answers) {
    const q = quiz.questions.find((x: any) => x.id === a.questionId);
    if (!q) continue;
    const userAns = String(a.answer).trim().toLowerCase();
    const correctAns = String(q.answer).trim().toLowerCase();
    const correct = q.type === 'short' ? userAns.length > 2 : userAns === correctAns;
    if (correct) score++;
    else wrongTopics[q.topic] = (wrongTopics[q.topic] || 0) + 1;
    totalTime += Number(a.timeMs) || 0;
    details.push({ questionId: q.id, question: q.question, correct, timeMs: Number(a.timeMs) || 0, userAnswer: a.answer, correctAnswer: q.answer, explanation: q.explanation });
  }

  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  const improvements = Object.entries(wrongTopics).map(([topic, count]) => ({ topic, count }));
  const avgTimeMs = details.length ? Math.round(totalTime / details.length) : 0;
  const grade = getGrade(percentage);

  const advice: string[] = improvements.map(({ topic }) =>
    `Review **${topic}**: focus on core definitions, worked examples, and practice problems.`
  );
  if (percentage === 100) advice.push('Perfect score! 🎉');

  const currentUser = getUserFromToken(req);

  const { data: result } = await supabase.from('quiz_results').insert({
    quiz_id: quiz.id,
    user_id: currentUser ? currentUser.userId : null,
    topic: quiz.topic,
    score,
    total,
    percentage,
    grade,
    improvements,
    avg_time_ms: avgTimeMs,
    details,
    advice
  }).select('*').single();

  if (currentUser) {
    await addXp(currentUser.userId, Math.round(percentage / 10) + 5);
  }

  res.status(201).json(result);
});

app.get('/api/quiz-results', async (req, res) => {
  const { data } = await supabase.from('quiz_results').select('*').order('created_at', { ascending: false }).limit(20);
  res.json(data || []);
});

app.get('/api/quiz-report/:resultId', async (req, res) => {
  const { data: result } = await supabase.from('quiz_results').select('*').eq('id', req.params.resultId).single();
  if (!result) return res.status(404).json({ error: 'Result not found' });
  res.json(result);
});

// ── HELP TICKETS ───────────────────────────────────────────────────────────────
app.post('/api/help', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
  
  const { data: ticket } = await supabase.from('help_tickets').insert({ name, email, message }).select('*').single();
  res.status(201).json({ id: ticket?.id, message: 'Ticket submitted. We will respond within 24 hours.' });
});

// ── STATS / LEADERBOARD ────────────────────────────────────────────────────────
app.get('/api/leaderboard', async (_, res) => {
  const { data } = await supabase.from('users').select('username, xp, streak').order('xp', { ascending: false }).limit(20);
  if (data) {
    res.json(data.map((u: any, i: number) => ({ rank: i + 1, username: u.username, xp: u.xp, streak: u.streak })));
  } else {
    res.json([]);
  }
});

app.get('/api/stats', authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user.userId).single();
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { data: results } = await supabase.from('quiz_results').select('percentage').eq('user_id', user.id);
  const avgScore = results && results.length ? Math.round(results.reduce((a: number, r: any) => a + r.percentage, 0) / results.length) : 0;
  
  const { count: docsCount } = await supabase.from('uploaded_docs').select('id', { count: 'exact' });
  
  res.json({ xp: user.xp, streak: user.streak, quizzesTaken: results?.length || 0, avgScore, uploadsCount: docsCount || 0 });
});

// ── START ──────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🚀 LearnEase API running on http://localhost:${port}`);
  console.log(`   AI Model: ${GROQ_MODEL}`);
  console.log(`   Groq AI: ${groq ? '✅ Connected' : '❌ No GROQ_API_KEY'}`);
  console.log(`   Supabase: ${supabaseUrl ? '✅ Connected' : '❌ No SUPABASE_URL'}\n`);
});
