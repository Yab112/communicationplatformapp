## Project Presentation: Intelligent Campus Helpdesk Assistant

**Developer:** Yabibal Eshetie
**Date:** June 17, 2025
**Project:** A context-aware, AI-powered customer support chatbot for a university helpdesk.

---

### 1. Project Overview

This project involved the end-to-end development of a sophisticated, AI-powered chatbot designed to serve as a 24/7 automated support assistant for a university campus. The primary goal was to create a chatbot that could move beyond simple, stateless responses and engage in meaningful, context-aware conversations. The final product is a professional, responsive, and intelligent assistant, grounded in a custom knowledge base to provide accurate and helpful answers to student queries.

---

### 2. Core Objective

To build a production-ready chatbot that understands conversation history, leverages a specific knowledge base to prevent hallucinations, and provides a seamless, professional user experience that mimics a real support agent.

---

### 3. Key Features Delivered

* **Stateful Conversation:** The chatbot successfully remembers previous messages in a conversation to understand context (e.g., follow-up questions).
* **Retrieval-Augmented Generation (RAG):** The AI is connected to a custom knowledge base (a vector store created from 39+ Q&As). It retrieves relevant information *before* answering a question, ensuring its responses are accurate and based on facts, not guesses.
* **Professional User Interface:** A completely redesigned, modern chat UI featuring:
    * A human-like support agent avatar.
    * Smooth animations using Framer Motion.
    * A proactive "welcome bubble" and launcher with a "ping" animation to engage users.
    * Full responsiveness and dark mode support via Tailwind CSS variables.
* **Rich Text Formatting:** AI responses that include Markdown (like bullet points and bold text) are correctly rendered as formatted HTML for readability.
* **Robust Backend:** A resilient Next.js API route that handles chat history, context management, and secure communication with the Google AI platform.

---

### 4. Technology Stack

* **Frontend:**
    * **Framework:** Next.js 15 / React 19
    * **Language:** TypeScript
    * **Styling:** Tailwind CSS v4
    * **UI Components:** shadcn/ui
    * **Animation:** Framer Motion
    * **Icons:** Lucide React

* **Backend & API:**
    * **Framework:** Next.js API Routes
    * **Environment:** Node.js v21

* **Artificial Intelligence & Machine Learning:**
    * **Core LLM:** Google Gemini Pro
    * **Embeddings Model:** Google `text-embedding-004`
    * **Framework Concepts:** LangChain (used for architectural patterns like RAG)
    * **Orchestration:** Custom logic using `@google/generative-ai` and `@langchain/google-genai` libraries.

* **Knowledge Base:**
    * **Data Source:** Structured JSON file of Q&As.
    * **Vector Store:** In-memory vector database managed by `langchain/vectorstores/memory`.

---

### 5. System Architecture

The project operates in two distinct pipelines:

#### A. Indexing Pipeline (One-Time Setup)
This offline process converts the knowledge base into a format the AI can search.
1.  **Data Ingestion:** A Node.js script reads the source `aau-knowledge-base.json` file.
2.  **Embedding Generation:** For each Q&A pair, the script sends the text to the Google Embeddings API.
3.  **Vector Creation:** Google returns a vector (a numerical representation) for each text chunk.
4.  **Indexing:** The script saves the original text alongside its corresponding vector into a final `indexed-knowledge.json` file. This file acts as our pre-compiled "AI brain."

#### B. Runtime Pipeline (Live Chat)
This is what happens every time a user sends a message.
1.  **User Input:** The user types a message in the Next.js frontend.
2.  **API Request:** The frontend sends the new message AND the entire previous chat history to the `/api/chat` route.
3.  **Load & Search (RAG):** The server loads the `indexed-knowledge.json` into the in-memory vector store. It then searches this store to find the top 3 most relevant knowledge snippets related to the user's message.
4.  **Prompt Engineering:** A detailed prompt is constructed containing the System Instructions (the bot's persona), the retrieved knowledge snippets, and the user's current question.
5.  **AI Inference:** The complete prompt and the valid chat history are sent to the Google Gemini Pro model.
6.  **Response Generation:** The AI generates a response based on all the provided context.
7.  **UI Update:** The response is sent back to the frontend, which updates the chat window and waits for the next user input.

---

### 6. Key Technical Challenges & Solutions

* **Challenge 1: Context Loss ("Amnesia")**
    * **Problem:** The chatbot initially treated every message as new.
    * **Solution:** Implemented a robust state management system where the frontend holds the chat history and sends it with every API call. This was fixed by correcting a "stale state" bug in the React component's `handleSubmit` function.

* **Challenge 2: Module System Conflicts**
    * **Problem:** Running a standalone TypeScript script (`ts-node`) for indexing conflicted with the Next.js project's modern ES Module system, causing `SyntaxError` and `ERR_REQUIRE_ESM` errors.
    * **Solution:** After several iterations, the most stable solution was to use the `.mts` file extension for the script and execute it with `node --loader ts-node/esm --project tsconfig.json`, which explicitly tells Node.js how to handle the file without disrupting the main application.

* **Challenge 3: API & UI Bugs**
    * **Problem:** The application crashed due to strict API rules (e.g., chat history must start with a 'user' role) and had UI bugs like unreliable scrolling.
    * **Solution:** Added validation logic on the backend to clean the history before sending it to the Google API. The scrolling was fixed by implementing a more robust `useEffect` hook that directly targets the `ScrollArea` viewport's `scrollTop` property.

---

### 7. Final Outcome

The project successfully culminates in a polished, functional, and intelligent chatbot that meets all core objectives. It provides a blueprint for building advanced, knowledge-grounded conversational AI applications using a modern tech stack.