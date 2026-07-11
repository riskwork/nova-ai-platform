# Nova AI Platform

> A next-generation ChatGPT-like AI assistant platform built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Prisma & the Z.ai LLM SDK.

Nova AI delivers a premium, ChatGPT-style conversational experience with streaming responses, persistent conversation history, file uploads, and a beautiful glassmorphism UI.

![Nova AI](public/logo.svg)

## ✨ Features

- **Streaming AI responses** — token-by-token streaming via Server-Sent Events (SSE)
- **ChatGPT-like dashboard** — sidebar with chat history, search, pin/rename/delete
- **Markdown + code rendering** — syntax-highlighted code blocks (Prism)
- **File uploads** — PDF, DOCX, TXT, CSV, images (up to 100 MB)
- **Multi-model support** — Gemini 2.5 Flash/Pro, GLM-4.6, GLM-4.5 Air
- **Persistent sessions** — cookie-based guest auth, conversation history saved
- **Premium glassmorphism UI** — aurora gradients, frosted glass panels, emerald/teal theme
- **Light / Dark / System themes** with `next-themes`
- **Settings & profile** — temperature, top-p, max tokens, system prompt, streaming toggle
- **Auto-generated chat titles** from the first user message
- **Fully responsive** — mobile sidebar collapses to a sheet
- **SEO & AEO optimized** — metadata, Open Graph, Twitter cards, semantic HTML

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Animations | Framer Motion |
| Database | Prisma ORM + SQLite |
| AI | Z.ai LLM SDK (`z-ai-web-dev-sdk`) |
| State | Zustand (client) |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| Icons | lucide-react |
| Toasts | sonner |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- A package manager (Bun recommended, npm/pnpm/yarn also work)

### Installation

```bash
# Clone
git clone https://github.com/riskwork/nova-ai-platform.git
cd nova-ai-platform

# Install dependencies
bun install   # or: npm install

# Set up the database
cp .env.example .env
bun run db:push   # creates the SQLite database

# Start the dev server
bun run dev
```

Open http://localhost:3000 in your browser.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Prisma SQLite connection string | `file:./db/custom.db` |

The Z.ai SDK is pre-configured and requires no additional API key in this environment.

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Guest session (me, guest)
│   │   ├── chat/          # Chat CRUD + stream (SSE)
│   │   ├── messages/      # Message list & delete
│   │   ├── upload/        # File upload (multipart)
│   │   ├── profile/       # User profile
│   │   └── settings/      # User settings
│   ├── globals.css        # Glassmorphism theme + utilities
│   ├── layout.tsx         # Root layout (ThemeProvider, Sonner, metadata)
│   └── page.tsx           # SPA switch (Landing ↔ Dashboard)
├── components/
│   ├── landing/           # Navbar, Hero, Features, Pricing, FAQ, etc.
│   ├── dashboard/         # Sidebar, Dashboard orchestrator, panels
│   ├── chat/              # ChatView, MessageList, ChatInput, etc.
│   ├── theme-provider.tsx
│   └── ui/                # shadcn/ui components
├── hooks/
│   └── use-chat-actions.ts  # Central send/stream/regenerate logic
├── lib/
│   ├── ai.ts              # Z.ai SDK wrapper (true token streaming)
│   ├── api.ts             # Typed client API helper
│   ├── auth.ts            # Cookie-based guest sessions
│   ├── db.ts              # Prisma client
│   └── utils.ts
├── store/
│   └── use-app.ts         # Zustand store (view, chats, messages, settings)
└── types/
    └── index.ts           # Shared types + AI_MODELS, SUGGESTED_PROMPTS
```

## 🎯 Usage

1. **Landing page** — browse features, models, pricing, FAQ
2. Click **"Launch App"** or **"Start Chatting Free"** to enter the dashboard
3. **Start chatting** — type a message and watch the AI stream its response
4. **Manage chats** — search, pin, rename, or delete from the sidebar
5. **Upload files** — attach PDFs, docs, or images to your messages
6. **Customize** — open Settings to tweak temperature, system prompt, theme, etc.
7. **Switch themes** — light/dark/system via the toggle in the navbar

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/guest` | Create/return a guest user + set session cookie |
| `GET` | `/api/auth/me` | Get current user + settings |
| `GET` | `/api/chat` | List all chats |
| `POST` | `/api/chat` | Create a chat |
| `PATCH` | `/api/chat` | Update a chat (title, pinned, model) |
| `DELETE` | `/api/chat?id=` | Delete a chat |
| `POST` | `/api/chat/stream` | Send a message & stream the AI response (SSE) |
| `GET` | `/api/messages?chatId=` | List messages in a chat |
| `DELETE` | `/api/messages?id=` | Delete a message |
| `POST` | `/api/upload` | Upload a file (multipart/form-data) |
| `DELETE` | `/api/upload?id=` | Delete an uploaded file |
| `GET` | `/api/profile` | Get profile |
| `PUT` | `/api/profile` | Update profile |
| `GET` | `/api/settings` | Get settings |
| `PUT` | `/api/settings` | Update settings |

### SSE Stream Contract

The `/api/chat/stream` endpoint emits these events:

| Event | Payload | Description |
|---|---|---|
| `user` | `{ message }` | The persisted user message |
| `title` | `{ chatId, title }` | Auto-generated title (first message only) |
| `assistant_start` | `{ id }` | New assistant message ID |
| `delta` | `{ delta, full }` | Streamed token + accumulated full text |
| `done` | `{ message }` | Final persisted assistant message |
| `error` | `{ message }` | Error description |

## 🗄 Database Schema

Defined in `prisma/schema.prisma`:

- **User** — id, email, name, avatar, bio, timestamps
- **Chat** — id, userId, title, pinned, archived, model, timestamps
- **Message** — id, chatId, role, content, tokenCount, attachments, createdAt
- **File** — id, userId, fileName, storagePath, mimeType, fileSize, createdAt
- **Settings** — id, userId, theme, language, temperature, topP, maxTokens, systemPrompt, streamingMode, notifications, soundEnabled, sendOnEnter

## 🛡 Security

- Cookie-based sessions (httpOnly, sameSite=lax)
- All API routes validate ownership before mutating data
- File upload size limit (100 MB)
- `.env` and database files are gitignored
- No API keys exposed to the client

## 📜 Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start the dev server (port 3000) |
| `bun run build` | Production build |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to the database |
| `bun run db:generate` | Regenerate Prisma client |

## 🗺 Roadmap

- **Phase 2** — Voice conversations, TTS/ASR, AI image & video generation, AI vision
- **Phase 3** — Multiple AI providers (OpenAI, Claude, DeepSeek), AI agents, RAG, MCP, team workspaces, prompt library
- **Phase 4** — Enterprise dashboard, Stripe billing, usage analytics, admin console

## 📄 License

This project is proprietary. All rights reserved.

---

Built with ❤️ using Next.js, Tailwind CSS, shadcn/ui, and the Z.ai LLM SDK.
