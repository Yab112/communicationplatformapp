# Campus Helpdesk Chatbot

A Next.js-based campus helpdesk chatbot using Google's Gemini API for natural language understanding and intent detection.

## Features

- Intent detection using Gemini AI
- Handles multiple types of campus-related queries:
  - Course information
  - Schedules
  - Grades
  - Campus facilities
  - Events
  - General inquiries
- TypeScript support
- Easy to extend and customize

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory with the following variables:
```
GOOGLE_API_KEY=your_google_api_key_here
```

3. Get a Google API key:
   - Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

## Usage

### API Endpoint

The chatbot is accessible via a POST request to `/api/chat`:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What are the library hours today?',
    context: {
      userId: 'user123',
      sessionId: 'session456',
    },
  }),
})

const data = await response.json()
```

### Response Format

```typescript
{
  response: string;  // The chatbot's response
  intent: {
    type: string;   // Detected intent type
    confidence: number;  // Confidence score
    entities?: Record<string, string>;  // Extracted entities
  }
}
```

## Intent Types

The chatbot can detect the following intents:

- `course_info`: Questions about courses, professors, or academic programs
- `schedule`: Questions about class schedules, academic calendar, or deadlines
- `grades`: Questions about grades, GPA, or academic performance
- `facilities`: Questions about campus facilities, buildings, or resources
- `events`: Questions about campus events, activities, or organizations
- `general`: General inquiries or greetings
- `unknown`: When the intent cannot be determined

## Customization

You can customize the chatbot's behavior by:

1. Modifying intent types in `types/chat.ts`
2. Adjusting intent detection prompts in `lib/intent-detection.ts`
3. Updating intent-specific responses in `lib/intent-handler.ts`

## Error Handling

The chatbot includes built-in error handling for:
- Invalid requests
- API failures
- Intent detection errors
- Response generation errors

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

## Production

Build and start the production server:

```bash
npm run build
npm start
# or
yarn build
yarn start
```
