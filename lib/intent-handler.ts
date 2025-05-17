import { GoogleGenerativeAI } from '@google/generative-ai'
import { type Intent } from '@/types/chat'

// First, let's add a check for the API key
if (!process.env.GOOGLE_API_KEY) {
  console.warn('WARNING: GOOGLE_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

// Base context for the chatbot
const BASE_CONTEXT = `You are a helpful campus helpdesk assistant. Your responses should be:
- Friendly and professional
- Concise but informative
- Focused on addressing the specific query
- Include relevant details when available`

// Intent-specific prompts
const INTENT_PROMPTS: Record<string, string> = {
  course_info: `You are helping with course-related inquiries. Provide information about:
- Course descriptions and requirements
- Professor information
- Prerequisites and academic programs`,
  
  schedule: `You are helping with schedule-related inquiries. Provide information about:
- Class timings and locations
- Academic calendar dates
- Important deadlines`,
  
  grades: `You are helping with grade-related inquiries. Provide information about:
- Grading policies
- GPA calculation
- Academic performance resources`,
  
  facilities: `You are helping with campus facilities inquiries. Provide information about:
- Building locations and hours
- Available resources and services
- Access and usage guidelines`,
  
  events: `You are helping with campus events inquiries. Provide information about:
- Upcoming events and activities
- Student organizations
- Registration and participation details`,
  
  general: `You are helping with general campus inquiries. Provide helpful information while maintaining a friendly tone.`
}

export async function handleIntent(intent: Intent, message: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Google API key is missing in environment variables')
      throw new Error('Google API key is not configured')
    }

    console.log('Initializing Gemini model with intent:', intent.type)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    // Construct the prompt based on intent
    const intentPrompt = INTENT_PROMPTS[intent.type] || INTENT_PROMPTS.general
    const prompt = `${BASE_CONTEXT}
${intentPrompt}

User query: ${message}
Extracted entities: ${JSON.stringify(intent.entities)}

Provide a helpful response:`

    console.log('Sending request to Gemini API...')
    const result = await model.generateContent(prompt)
    
    if (!result || !result.response) {
      throw new Error('No response received from Gemini API')
    }

    console.log('Received response from Gemini API')
    const response = result.response
    const text = response.text()
    
    if (!text) {
      throw new Error('Empty response from Gemini API')
    }

    return text
  } catch (error) {
    // Log the full error details
    console.error('Intent handling error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      apiKey: process.env.GOOGLE_API_KEY ? 'Present (length: ' + process.env.GOOGLE_API_KEY.length + ')' : 'Missing',
      intent: intent.type
    })

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'Configuration error: The AI service is not properly configured. Please contact the system administrator.'
      }
      if (error.message.includes('fetch failed') || error.message.includes('network')) {
        return 'Network error: Unable to connect to the AI service. Please check your internet connection and try again.'
      }
      if (process.env.NODE_ENV === 'development') {
        return `Error: ${error.message}`
      }
    }
    return 'I apologize, but I encountered an error while processing your request. Please try again or contact the helpdesk directly.'
  }
} 