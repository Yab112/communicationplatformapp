import { GoogleGenerativeAI } from '@google/generative-ai'
import { type Intent } from '@/types/chat'
import {BASE_SYSTEM_PROMPT,INTENT_HANDLER_PROMPTS} from '@/constants/prompts'

// First, let's add a check for the API key
if (!process.env.GOOGLE_API_KEY) {
  console.warn('WARNING: GOOGLE_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)




export async function handleIntent(intent: Intent, message: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Google API key is missing in environment variables')
      throw new Error('Google API key is not configured')
    }

    console.log('Initializing Gemini model with intent:', intent.type)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    // Construct the prompt based on intent
    const intentPrompt = INTENT_HANDLER_PROMPTS[intent.type] || INTENT_HANDLER_PROMPTS.general
    const prompt = `${BASE_SYSTEM_PROMPT}
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