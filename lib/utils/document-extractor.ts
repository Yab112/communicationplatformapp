import mammoth from 'mammoth'
import fs from 'fs'
import path from 'path'

export interface Intent {
  intent: string
  patterns: string[]
  responses: string[]
  context: string[]
}

export interface KnowledgeBase {
  intents: Intent[]
  metadata: {
    lastUpdated: string
    source: string
    version: string
  }
}

export async function extractFromWordDocument(filePath: string): Promise<KnowledgeBase> {
  try {
    // Read the Word document
    const buffer = fs.readFileSync(filePath)
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value

    // Split the document into sections
    const sections = text.split('\n\n').filter(section => section.trim())

    // Process sections to extract intents
    const intents: Intent[] = []
    let currentIntent: Partial<Intent> = {}

    for (const section of sections) {
      const lines = section.split('\n').map(line => line.trim()).filter(Boolean)

      // Check if this is a new intent section
      if (lines[0].toLowerCase().includes('intent:')) {
        if (Object.keys(currentIntent).length > 0) {
          intents.push(currentIntent as Intent)
        }
        currentIntent = {
          intent: lines[0].replace('Intent:', '').trim(),
          patterns: [],
          responses: [],
          context: []
        }
      } else if (lines[0].toLowerCase().includes('patterns:')) {
        currentIntent.patterns = lines.slice(1).filter(line => line.startsWith('-')).map(line => line.replace('-', '').trim())
      } else if (lines[0].toLowerCase().includes('responses:')) {
        currentIntent.responses = lines.slice(1).filter(line => line.startsWith('-')).map(line => line.replace('-', '').trim())
      } else if (lines[0].toLowerCase().includes('context:')) {
        currentIntent.context = lines.slice(1).filter(line => line.startsWith('-')).map(line => line.replace('-', '').trim())
      }
    }

    // Add the last intent
    if (Object.keys(currentIntent).length > 0) {
      intents.push(currentIntent as Intent)
    }

    // Create the knowledge base structure
    const knowledgeBase: KnowledgeBase = {
      intents,
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: path.basename(filePath),
        version: '1.0.0'
      }
    }

    // Save to JSON file
    const outputPath = path.join(process.cwd(), 'data', 'knowledge-base.json')
    fs.writeFileSync(outputPath, JSON.stringify(knowledgeBase, null, 2))

    return knowledgeBase
  } catch (error) {
    console.error('Error extracting data from Word document:', error)
    throw error
  }
} 