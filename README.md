# LearnEase — AI-Powered Learning Platform

LearnEase is a full-stack SaaS learning platform that uses AI to help students learn smarter. Upload your study materials, chat with an AI mentor, take adaptive quizzes, and track your skill progress.

## Features

- 🤖 **AI Chat Mentor** — Ask anything, get personalized explanations
- 📄 **Smart Materials** — Upload PDFs/notes; AI indexes and answers from them
- ⚡ **Adaptive Quizzes** — Auto-generated quizzes targeting your weak spots
- 🌳 **Skill Trees** — Visual progress tracking across subjects
- 👥 **Study Circles** — Community study groups with peers
- 🏆 **Leaderboards** — Friendly competition with token rewards

## Tech Stack

**Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts  
**Backend:** Express.js + TypeScript, Groq AI (LLaMA 3.3), JWT auth  
**Storage:** Supabase (file uploads), in-memory (dev)

## Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com/)
- A [Supabase](https://supabase.com/) project (for file uploads)

### Frontend Setup

```bash
npm install
cp .env.example .env   # add your env vars
npm run dev
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env   # add GROQ_API_KEY, JWT_SECRET
npm run dev
```

### Environment Variables

**Frontend (`.env`):**
```
VITE_API_BASE_URL=http://localhost:3002
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (`server/.env`):**
```
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret
PORT=3002
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (marketing) |
| `/auth` | Sign in / Sign up |
| `/dashboard` | Main dashboard |
| `/chat` | AI Chat |
| `/mentor` | AI Tutor with materials |
| `/materials` | Study materials library |
| `/quiz` | Adaptive quiz |
| `/skill-tree` | Progress tracking |
| `/community` | Study circles |
| `/leaderboard` | Rankings |
| `/profile` | User profile |
| `/settings` | Preferences |
| `/help` | Help & diagnostics |

## Deployment

**Frontend:** Deploy to Vercel — `npm run build` → upload `dist/`  
**Backend:** Deploy to Render — set env vars, start command: `npm start`

Set `VITE_API_BASE_URL` in Vercel to your Render backend URL.
