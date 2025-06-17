🧠 Communication Platform
A comprehensive communication and resource management platform tailored for educational institutions. It features real-time messaging, course and resource management, and AI-powered campus assistance.

🚀 Features
🧩 Core Features
AI-Powered Campus Assistant – Intelligent chatbot powered by LangChain and Gemini

Retrieval-Augmented Generation (RAG) – Context-aware answers using indexed documents

Real-time Chat – Private and group messaging with live updates and read receipts

Resource Management – Upload, preview, and share educational files

User Authentication – Role-based access (Student, Teacher, Admin) with secure login

Department & Club Pages – Spaces for academic and extracurricular coordination

Document Library – Centralized repository for shared content

🤖 AI Chatbot Features
LangChain Integration – Manages conversation flow and context

Google Gemini – High-quality LLM for accurate responses

RAG System – Retrieves contextually relevant data from knowledge base

Conversation History – Maintains multi-turn chat context

Markdown Support – Supports rich text replies in chat

⚙️ Tech Stack
Frontend
Framework: Next.js 15 (App Router)

Language: TypeScript

UI: shadcn/ui, Radix UI, Tailwind CSS (with CSS Variables)

State Management: Zustand

Forms & Validation: React Hook Form + Zod

Real-time: Socket.IO

Animations: Framer Motion

Icons: Lucide React

Backend
Runtime: Node.js

Framework: Express.js

AI Integration:

LangChain – Conversational logic

Google Gemini – Language model

Vector Embeddings – Semantic search

Database: PostgreSQL (Neon)

Authentication: JWT + NextAuth.js

Vector Store: MemoryVectorStore

Documentation: Swagger/OpenAPI

🛠️ Getting Started
🔗 Prerequisites
Node.js 18+

MongoDB (for session or metadata)

PostgreSQL (Neon recommended)

Google API Key (for Gemini)

📦 Installation
Clone the Repository

bash
Copy
Edit
git clone https://github.com/Yab112/communicationplatformapp.git
cd communicationplatformapp
Install Dependencies

bash
Copy
Edit
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
Environment Variables

Create .env files in both frontend/ and backend/:

env
Copy
Edit
# Frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Backend/.env
NEON_DATABASE_URL=your_neon_connection_string
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=your_jwt_secret
Start Development Servers

bash
Copy
Edit
# Frontend
cd frontend
npm run dev
npm run start-socket

# Backend
cd ../backend
npm run dev
Access the App

Frontend: http://localhost:3000

Backend API: http://localhost:3000/api

🧠 AI Chatbot Overview
The AI Assistant is powered by LangChain and Gemini with support for RAG:

LangChain: Manages multi-turn conversation logic

Embeddings: Uses text-embedding-004 for semantic search

Indexed Data: Stored in data/indexed-knowledge.json

RAG: Retrieves context from indexed documents

🐳 Docker Setup
To run everything with Docker:

bash
Copy
Edit
docker-compose up --build
Access
Frontend: http://localhost:3000

API: http://localhost:3000/api

📁 Project Structure
bash
Copy
Edit
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
🧪 Scripts
Frontend
bash
Copy
Edit
npm run dev         # Start dev server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Lint the codebase
Backend
bash
Copy
Edit
npm run dev         # Start with hot-reload
npm run build       # Compile TypeScript
npm start           # Run production server
npm run lint        # Lint backend code
🤝 Contributing
Fork the repository

Create your branch: git checkout -b feature/your-feature

Commit your changes: git commit -am 'Add feature'

Push: git push origin feature/your-feature

Open a Pull Request

📄 License
Licensed under the MIT License.

🙏 Acknowledgments
Next.js

shadcn/ui

Tailwind CSS

LangChain

Google Gemini

Radix UI

Neon – Serverless PostgreSQL