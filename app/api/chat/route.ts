// app/api/chat/route.ts (Final Corrected Version - June 17, 2025)
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { type ChatRequest } from "@/types/chat";
import { BASE_SYSTEM_PROMPT } from "@/constants/prompts";
import { retrieveKnowledge } from "@/lib/rag";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { message, context } = body;
    // console.log("--- NEW REQUEST ---");
    // console.log("Received Message:", message);
    // console.log("Received Context:", JSON.stringify(context, null, 2));

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // 1. Prepare the actual conversation history (user and model turns only)
    const history = (context?.previousMessages || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 2. **Crucial Check:** Remove all leading 'model' messages so the first is always 'user'.
    while (history.length > 0 && history[0].role === "model") {
      history.shift();
    }

    // 2. Start the chat session with only the real history
    const chat = model.startChat({
      history,
    });

    // 3. Get the relevant knowledge for the current user query
    const knowledge = await retrieveKnowledge(message);

    // 4. Construct a single, powerful prompt for this turn
    // This prompt includes the system instructions, the retrieved knowledge, and the user's actual question.
    const finalPrompt = `
    ---
    SYSTEM INSTRUCTIONS:
    ${BASE_SYSTEM_PROMPT}
    ---
    RELEVANT KNOWLEDGE:
    ${knowledge}
    ---
    USER'S QUESTION:
    ${message}
    `;

    const result = await chat.sendMessage(finalPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat error:", error);
    // This provides a more detailed error in your server logs
    const errorDetails = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorDetails },
      { status: 500 }
    );
  }
}
