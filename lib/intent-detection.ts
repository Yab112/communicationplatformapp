import { GoogleGenerativeAI } from '@google/generative-ai'
import { type Intent } from '@/types/chat'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

const INTENT_PROMPT = `You are a campus helpdesk assistant. Analyze the user message and detect the intent.
Return a JSON object with the following structure:
{
  "type": "intent_type",
  "confidence": confidence_score,
  "entities": { extracted_entities }
}

Intent types:
- course_info: Questions about courses, professors, or academic programs
- schedule: Questions about class schedules, academic calendar, or deadlines
- grades: Questions about grades, GPA, or academic performance
- facilities: Questions about campus facilities, buildings, or resources
- events: Questions about campus events, activities, or organizations
- general: General inquiries or greetings
- unknown: When the intent cannot be determined

Example:
User: "What's the schedule for CS101?"
{
  "type": "schedule",
  "confidence": 0.95,
  "entities": {
    "course": "CS101"
  }
}

Analyze this message:`

export async function detectIntent(message: string): Promise<Intent> {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Google API key is missing in environment variables')
      throw new Error('Google API key is not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `${INTENT_PROMPT}\n${message}`
    
    console.log('Sending intent detection request...')
    const result = await model.generateContent(prompt)
    
    if (!result || !result.response) {
      throw new Error('No response received from Gemini API')
    }

    const response = result.response
    const text = response.text()
    
    if (!text) {
      throw new Error('Empty response from Gemini API')
    }

    try {
      const intentData = JSON.parse(text)
      return {
        type: intentData.type || 'unknown',
        confidence: intentData.confidence || 0,
        entities: intentData.entities || {}
      }
    } catch (parseError) {
      console.error('Failed to parse intent:', parseError, 'Raw response:', text)
      return {
        type: 'unknown',
        confidence: 0,
        entities: {}
      }
    }
  } catch (error) {
    console.error('Intent detection error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return {
      type: 'unknown',
      confidence: 0,
      entities: {}
    }
  }
} 