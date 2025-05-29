import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'
import type { Intent, KnowledgeBase } from '@/lib/utils/document-extractor'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export class ChatService {
  private knowledgeBase!: KnowledgeBase
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  constructor() {
    this.loadKnowledgeBase()
  }

  private loadKnowledgeBase() {
    try {
      const filePath = path.join(process.cwd(), 'data', 'knowledge-base.json')
      const data = fs.readFileSync(filePath, 'utf-8')
      this.knowledgeBase = JSON.parse(data)
    } catch (error) {
      console.error('Error loading knowledge base:', error)
      // Initialize with empty knowledge base if file doesn't exist
      this.knowledgeBase = {
        intents: [],
        metadata: {
          lastUpdated: new Date().toISOString(),
          source: 'empty',
          version: '1.0.0'
        }
      }
    }
  }

  private async detectIntent(userMessage: string): Promise<string> {
    const prompt = `
      You are an AI assistant trained to understand user queries and match them to the most appropriate intent.
      Analyze the following user message and determine the most appropriate intent from the list below.
      Consider the context and patterns associated with each intent.
      Return ONLY the intent name, nothing else.

      User message: "${userMessage}"

      Available intents and their patterns:
      ${this.knowledgeBase.intents.map((intent: Intent) => `
        Intent: ${intent.intent}
        Patterns: ${intent.patterns.join(', ')}
        Context: ${intent.context.join(', ')}
      `).join('\n')}
    `

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  }

  private findIntent(intentName: string): Intent | undefined {
    return this.knowledgeBase.intents.find(
      (intent: Intent) => intent.intent.toLowerCase() === intentName.toLowerCase()
    )
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private async validateResponse(response: string, userMessage: string, context: string[]): Promise<string> {
    const prompt = `
      You are an AI assistant trained to validate and improve responses based on the given context.
      Review the following response and user message, considering the provided context.
      If the response is appropriate and accurate, return it as is.
      If the response needs improvement, enhance it to be more helpful, accurate, and contextually relevant.
      Make sure to maintain proper markdown formatting in the response.

      Context: ${context.join(', ')}

      User message: "${userMessage}"
      Current response: "${response}"

      Return ONLY the final response, nothing else.
      Ensure proper markdown formatting for:
      - Lists (use - or 1. for ordered lists)
      - Headers (use # for headers)
      - Bold text (use **text**)
      - Italic text (use *text*)
      - Code blocks (use \`\`\` for code blocks)
      - Links (use [text](url))
    `

    const result = await this.model.generateContent(prompt)
    const validatedResponse = await result.response
    return validatedResponse.text().trim()
  }

  private formatResponse(response: string): string {
    // Ensure proper spacing for markdown elements
    return response
      // Add space after list markers
      .replace(/^[-*+]\s*/gm, '- ')
      // Add space after numbered list markers
      .replace(/^\d+\.\s*/gm, (match) => match + ' ')
      // Ensure proper spacing for headers
      .replace(/^(#{1,6})\s*/gm, '$1 ')
      // Ensure proper spacing for code blocks
      .replace(/```(\w*)\n/g, '```$1\n')
      // Ensure proper spacing for blockquotes
      .replace(/^>\s*/gm, '> ')
      // Ensure proper spacing for horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, '---\n')
  }

  async processMessage(userMessage: string): Promise<string> {
    try {
      // Detect intent using Gemini
      const detectedIntent = await this.detectIntent(userMessage)
      
      // Find matching intent in knowledge base
      const intent = this.findIntent(detectedIntent)
      
      if (!intent) {
        return "I'm sorry, I don't understand your question. Could you please rephrase it?"
      }

      // Get a random response from the intent's responses
      const initialResponse = this.getRandomResponse(intent.responses)

      // Validate and potentially improve the response using Gemini
      const validatedResponse = await this.validateResponse(
        initialResponse,
        userMessage,
        intent.context
      )

      // Format the response while preserving markdown
      const formattedResponse = this.formatResponse(validatedResponse)

      return formattedResponse
    } catch (error) {
      console.error('Error processing message:', error)
      return "I apologize, but I'm having trouble processing your request right now. Please try again later."
    }
  }
} 