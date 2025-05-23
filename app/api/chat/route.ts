import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { type ChatRequest } from '@/types/chat'
import { detectIntent } from '@/lib/intent-detection'
import { handleIntent } from '@/lib/intent-handler'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json() as ChatRequest
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Detect intent using Gemini
    const intent = await detectIntent(message)

    // Handle the detected intent
    const response = await handleIntent(intent, message)

    return NextResponse.json({ response, intent })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 