# 🧠 Communication Platform

A comprehensive platform for educational institutions, featuring real-time messaging, resource management, AI-powered campus assistance, and more. Built with Next.js 15, TypeScript, and a modern UI.

---

## 🚀 Features

### Core Features

- **AI-Powered Campus Assistant** – Chatbot powered by Gemini (Google) and LangChain, with context-aware answers (RAG)
- **Real-time Chat** – Private and group messaging, live updates, read receipts, emoji support, and file attachments
- **Resource Management** – Upload, preview, organize, and share educational files (PDF, DOCX, PPTX, XLSX, ZIP)
- **Resource Folders** – Create, manage, and share folders for resources
- **File Preview** – Inline preview for PDFs, images, and documents
- **User Authentication** – Role-based access (Student, Teacher, Admin) with secure login
- **Notifications** – Real-time notifications for messages, resources, and system events
- **Department & Club Pages** – Spaces for academic and extracurricular coordination
- **Document Library** – Centralized repository for shared content
- **Modern UI** – Responsive, accessible, and themeable (light/dark)

### 🤖 AI Chatbot Features

- **LangChain Integration** – Manages conversation flow and context
- **Google Gemini** – High-quality LLM for accurate responses
- **Retrieval-Augmented Generation (RAG)** – Contextual answers from indexed knowledge base
- **Conversation History** – Maintains multi-turn chat context
- **Markdown Support** – Rich text replies in chat (with code, lists, etc.)
- **Proactive Welcome Bubble** – Engages users automatically

---

## ⚙️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: shadcn/ui, Radix UI, Tailwind CSS (with CSS Variables)
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form + Zod
- **Real-time**: Socket.IO
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: marked + DOMPurify
- **Image Optimization**: next/image

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js (API), Next.js (API routes)
- **AI Integration**:
  - **LangChain** – Conversational logic
  - **Google Gemini** – Language model
  - **Vector Embeddings** – Semantic search
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT + NextAuth.js
- **Vector Store**: MemoryVectorStore
- **Documentation**: Swagger/OpenAPI

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (Neon recommended)
- Google API Key (for Gemini)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Yab112/communicationplatformapp.git
   cd communicationplatformapp
   ```
2. **Install Dependencies**

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Environment Variables**

   - Create `.env` files in both `frontend/` and `backend/`:

     ```env
     # Frontend/.env
     NEXT_PUBLIC_API_URL=http://localhost:3000/api

     # Backend/.env
     NEON_DATABASE_URL=your_neon_connection_string
     GOOGLE_API_KEY=your_google_api_key
     JWT_SECRET=your_jwt_secret
     ```

4. **Start Development Servers**

   ```bash
   # Frontend
   cd frontend
   npm run dev
   npm run start-socket

   # Backend
   cd ../backend
   npm run dev
   ```

5. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api

### 🧠 AI Chatbot Overview

- Powered by LangChain and Gemini (Google)
- Supports RAG (Retrieval-Augmented Generation) with indexed knowledge
- Multi-turn conversation, markdown replies, and proactive engagement

### 🐳 Docker Setup

To run everything with Docker:

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3000/api

### 📁 Project Structure

```
communicationplatformapp/
├── frontend/               # Next.js 15 frontend
│   ├── app/                # App Router structure
│   │   ├── api/            # AI & other routes
│   │   ├── (authenticated) # Protected routes
│   │   │   ├── chat/       # Chat system
│   │   │   ├── courses/    # Course pages
│   │   │   ├── resources/  # Resources section
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utils (includes rag.ts)
│   └── store/              # Zustand store
├── backend/                # Express.js API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Prisma schema & models
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   └── prisma/             # Prisma migration setup
└── docker-compose.yml      # Docker orchestration
```

### 🧪 Scripts

#### Frontend

```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Lint the codebase
```

#### Backend

```bash
npm run dev         # Start with hot-reload
npm run build       # Compile TypeScript
npm start           # Run production server
npm run lint        # Lint backend code
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Licensed under the MIT License.

---

## 🙏 Acknowledgments

- Next.js
- shadcn/ui
- Tailwind CSS
- LangChain
- Google Gemini
- Radix UI
- Neon
