# Communication Platform

A comprehensive communication and resource management platform for educational institutions, featuring real-time chat, course management, and AI-powered assistance.

## 🌟 Features

### Core Features
- **AI-Powered Campus Assistant** - Smart chatbot with LangChain integration for intelligent responses
- **Retrieval-Augmented Generation (RAG)** - Enhanced responses using indexed knowledge base
- **Real-time Chat** - Private and group messaging with read receipts
- **Resource Management** - Upload, organize, and share educational resources with previews
- **User Authentication** - Secure login with role-based access control
- **Department & Club Pages** - Dedicated spaces for academic and extracurricular activities
- **Document Library** - Centralized repository for all educational materials

### AI Chatbot Features
- **LangChain Integration** - Powers intelligent conversation flows
- **Google Gemini** - Advanced language model for natural interactions
- **Knowledge Retrieval** - Context-aware responses using RAG
- **Conversation History** - Maintains context across multiple messages
- **Markdown Support** - Rich text formatting in responses

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS with CSS Variables
- **State Management**: Zustand
- **Real-time**: Socket.IO
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI/ML**: 
  - LangChain for AI workflows
  - Google Gemini for natural language processing
  - Vector embeddings for semantic search
- **Database**: postgress with neon
- **Authentication**: JWT + NextAuth.js
- **Vector Store**: MemoryVectorStore for efficient similarity search
- **API Documentation**: Swagger/OpenAPI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Google API Key (for Gemini AI)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Yab112/communicationplatformapp.gitcommunication-platform.git]
   cd communication-platform
Install dependencies
bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
Set up environment variables
Create .env files in both frontend and backend directories
Required variables:
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Backend
neon=your_neon_connection_string
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=your_jwt_secret
Start the development servers
bash
# In frontend directory
npm run dev
npm run start-socket 

Access the application
Frontend: http://localhost:3000
API: http://localhost:3000/api
🤖 AI Chatbot Configuration
The platform includes an AI-powered chatbot with the following features:

LangChain Integration
Manages conversation flows
Handles context management
Processes user intents
Vector Embeddings
Uses Google's text-embedding-004 model
Implements semantic search
Enables knowledge retrieval
Knowledge Base
Stores indexed documents in 
data/indexed-knowledge.json
Supports dynamic updates
Enables RAG for accurate responses

🐳 Docker Setup
Build and start containers
bash
docker-compose up --build
Access services
Frontend: http://localhost:3000
Backend API: http://localhost:3000/api
📂 Project Structure
communication-platform/
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   │   ├── api/            # API routes
│   │   │   └── chat/       # AI Chatbot endpoints
│   │   ├── (authenticated) # Protected routes
│   │   │   ├── chat/       # Real-time chat
│   │   │   ├── courses/    # Course management
│   │   │   ├── resources/  # Resource management
│   │   │   └── ...         # Other features
│   ├── components/         # Reusable UI components
│   │   └── ChatBot/        # AI Chatbot components
│   ├── lib/                # Utility functions
│   │   └── rag.ts          # RAG implementation
│   └── store/              # State management (Zustand)
│
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   └── prisma/             # Database migrations
│
└── docker-compose.yml      # Docker configuration
🔧 Available Scripts
Frontend
npm run dev - Start development server
npm run build - Build for production
npm start - Start production server
npm run lint - Run ESLint
Backend
npm run dev - Start development server with hot-reload
npm run build - Compile TypeScript
npm start - Start production server
npm run lint - Run ESLint
🤝 Contributing
Fork the repository
Create a new branch (git checkout -b feature/your-feature)
Commit your changes (git commit -am 'Add some feature')
Push to the branch (git push origin feature/your-feature)
Create a new Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Next.js Documentation
shadcn/ui - Beautifully designed components
LangChain - AI application framework
Google Gemini - Advanced language model
Tailwind CSS - Utility-first CSS framework

