// src/app/api/enhance-text/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Ensure GOOGLE_API_KEY is in your .env.local and NOT prefixed with NEXT_PUBLIC_
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error('Google API key is not configured. AI enhancement will not work.');
}

// Initialize the AI client outside the handler for efficiency if possible,
// but only if the API key is guaranteed to be present.
// It's safer to initialize inside if there's any doubt or if you want to handle missing key gracefully per request.
let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function POST(request: Request) {
  if (!genAI) {
    return NextResponse.json(
      { error: 'AI service is not configured. Missing API key.' },
      { status: 500 }
    );
  }

  try {
    const { text, type = 'post' } = await request.json(); // Default type to 'post' if not provided

    if (!text) {
      return NextResponse.json({ error: 'Text to enhance is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Or 'gemini-1.5-flash' for potentially faster/cheaper

    // --- CRITICAL PROMPT CHANGE ---
    const prompt = `
      You are a text enhancement AI. Your task is to take the following text and improve it.
      Make it more engaging, clear, and professional, while maintaining the original message and tone appropriate for a professional platform.
      RULES:
      1. ONLY return the enhanced text.
      2. DO NOT include any explanations, introductions, preambles, salutations, or alternative options.
      3. DO NOT use markdown formatting like headings or bullet points unless the original text implies a list.
      4. If the input text is a short phrase or title (like for a 'resource'), keep the enhanced version concise.
      5. If the input text is longer (like for a 'post'), you can elaborate slightly but remain focused.

      The text to enhance is: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const enhancedText = response.text(); // This gets the actual text content

    if (!enhancedText) {
      console.warn("AI returned no text, returning original text for:", text);
      return NextResponse.json({ enhancedText: text }); // Fallback to original
    }

    return NextResponse.json({ enhancedText });

  } catch (error) {
    console.error('Text enhancement API error:', error);
    // Don't expose detailed error messages to the client unless necessary
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes("API key not valid")) {
         return NextResponse.json({ error: "AI API key is invalid. Please contact support." }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to enhance text due to an internal error.' }, { status: 500 });
  }
}