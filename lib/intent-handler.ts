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
  
  events: `You are helping with campus events inquiries. When responding to vague event queries:
1. Ask for clarification about:
   - Type of event (academic, social, sports, arts & culture)
   - Specific department or location preferences
   - Time frame if not specified
2. Mention that users can check the university event calendar directly
3. Keep responses friendly and helpful
4. If specific event details are known, include:
   - Event name, date, time, and location
   - Brief description
   - Registration information if required
   - Contact details for more information`,
  
  lost_id: `You are helping with lost ID card inquiries. When responding:

Hi there! I'm sorry to hear you lost your ID, but don't worry, we can get that sorted out for you! Here's what you should do:

1. Check Common Locations:
   - Where you last used it (e.g., dining hall, library)
   - Your classrooms
   - Your bag or pockets

2. Report it Lost:
   - Visit the Campus Card Services Office immediately
   - This prevents anyone else from using your ID
   - Location: [Insert Location of Campus Card Services Here]

3. Obtain a Replacement:
   - Bring a government-issued photo ID
   - Pay the replacement fee ([Insert Fee Amount Here])
   - Processing usually takes [Insert Time Frame]

4. Important Notes:
   - Your old ID will be deactivated once reported lost
   - If you find it later, it won't work anymore
   - A valid student ID is required for campus access

If you have any questions about this process, feel free to ask!`,
  
  general: `You are helping with general campus inquiries. Format responses with:
1. Clear hierarchical structure
2. Use main points and sub-points
3. Include specific details when available
4. Keep a friendly and helpful tone
5. Add relevant contact information`
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