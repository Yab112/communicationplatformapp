import { GoogleGenerativeAI } from '@google/generative-ai'
import { type Intent } from '@/types/chat'
import { INTENT_DETECTION_PROMPT } from '@/constants/prompts'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)



export async function detectIntent(message: string): Promise<Intent> {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Google API key is missing in environment variables')
      throw new Error('Google API key is not configured')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `${INTENT_DETECTION_PROMPT}\n${message}`
    
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