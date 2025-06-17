import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'; 
import { TaskType } from '@google/generative-ai';

// Interface for the input data from your JSON file
interface KnowledgeSourceItem {
  question: string;
  answer: string[];
}

// Interface for the final indexed output
export interface IndexedDocument {
  pageContent: string;
  embedding: number[];
  metadata: {
    question: string;
    source: string;
  };
}

// --- The Main Generation Function ---
async function generateAndSaveEmbeddings() {
  console.log('Starting knowledge extraction from JSON file...');
  const filePath = path.join(process.cwd(), 'data', 'aau-knowledge-base.json'); 
  
  // Read and parse the JSON knowledge base
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const knowledgeItems: KnowledgeSourceItem[] = JSON.parse(fileContent);

  if (knowledgeItems.length === 0) {
    console.error("No knowledge items were found in the JSON file.");
    return;
  }
  
  console.log(`Extracted ${knowledgeItems.length} Q&A pairs from the knowledge base.`);

  console.log('Initializing Google Embeddings model...');
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // Latest model
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  console.log('Generating embeddings for each Q&A pair...');
  const indexedDocuments: IndexedDocument[] = [];

  for (const item of knowledgeItems) {
    // We combine the question and answer to create a rich context for searching
    const docText = `Question: ${item.question}\nAnswer: ${item.answer.join(' ')}`;
    const vector = await embeddings.embedQuery(docText);
    
    indexedDocuments.push({
      pageContent: docText,
      embedding: vector,
      metadata: {
        question: item.question, // Store the original question in metadata
        source: path.basename(filePath),
      },
    });
  }
  
  console.log('All embeddings generated.');
  
  // Save the final indexed data to a new JSON file
  const outputPath = path.join(process.cwd(), 'data', 'indexed-knowledge.json');
  fs.writeFileSync(outputPath, JSON.stringify(indexedDocuments, null, 2));

  console.log(` Successfully created indexed knowledge base at ${outputPath}`);
}

generateAndSaveEmbeddings().catch(console.error);