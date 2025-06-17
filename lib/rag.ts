import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import fs from 'fs';
import path from 'path';

export interface IndexedDocument {
  pageContent: string;
  embedding: number[];
  metadata: {
    question: string;
    source: string;
  };
}

let vectorStore: MemoryVectorStore | null = null;

async function initializeVectorStore() {
    if (vectorStore) {
        return vectorStore;
    }

    console.log('Initializing Vector Store...');
    const filePath = path.join(process.cwd(), 'data', 'indexed-knowledge.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const indexedDocs: IndexedDocument[] = JSON.parse(fileContent);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004",
        taskType: TaskType.RETRIEVAL_QUERY,
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const store = new MemoryVectorStore(embeddings);

    await store.addVectors(
        indexedDocs.map(doc => doc.embedding),
        indexedDocs.map(doc => ({ pageContent: doc.pageContent, metadata: doc.metadata }))
    );

    console.log('✅ Vector Store initialized successfully.');
    vectorStore = store;
    return vectorStore;
}

export async function retrieveKnowledge(query: string, k: number = 3): Promise<string> {
    const store = await initializeVectorStore();

    console.log(`Searching for ${k} most relevant documents for query: "${query}"`);
    const relevantDocs = await store.similaritySearch(query, k);

    if (relevantDocs.length === 0) {
        return "No specific information found in the knowledge base.";
    }

    return relevantDocs.map(doc => doc.pageContent).join('\n\n---\n\n');
}