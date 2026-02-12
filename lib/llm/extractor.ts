import OpenAI from 'openai'
import { splitTranscript } from './chunker'
import { parseDueDate, calculateConfidence } from './postprocess'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

const EXTRACTION_SYSTEM_PROMPT = `You are an AI assistant that extracts actionable tasks from meeting transcripts.

Analyze the transcript and identify:
1. Clear action items or tasks
2. The person responsible (owner)
3. Any mentioned deadlines or due dates
4. Brief description of what needs to be done

Output JSON in this exact format:
{
  "tasks": [
    {
      "title": "Brief task title",
      "description": "Detailed description of the task",
      "owner": "Person's name from transcript",
      "due_date": "Mentioned date/deadline or null",
      "context": "Quote from transcript that generated this task"
    }
  ]
}

Rules:
- Only extract clear, actionable tasks
- Keep titles concise (under 60 characters)
- Extract owner name exactly as mentioned
- Include due_date only if explicitly mentioned
- Return empty array if no tasks found`

export interface ExtractedTask {
  title: string
  description: string
  owner: string
  dueDate: Date | null
  confidence: number
  context?: string
}

export async function extractTasks(
  transcript: string,
  meetingContext?: Date
): Promise<ExtractedTask[]> {
  const openai = getOpenAIClient()
  const chunks = splitTranscript(transcript)
  const allTasks: ExtractedTask[] = []

  for (const chunk of chunks) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: EXTRACTION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: chunk,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        logprobs: true,
        top_logprobs: 5,
      })

      const content = response.choices[0]?.message?.content
      const logprobs = response.choices[0]?.logprobs
      if (!content) continue

      const parsed = JSON.parse(content)
      const tasks = parsed.tasks || []

      // Calculate confidence from logprobs
      const confidence = logprobs ? calculateConfidence(logprobs) : 0.75

      for (const task of tasks) {
        allTasks.push({
          title: task.title,
          description: task.description,
          owner: task.owner,
          dueDate: task.due_date ? parseDueDate(task.due_date, meetingContext) : null,
          confidence: confidence,
          context: task.context,
        })
      }
    } catch (error) {
      console.error('Error extracting tasks from chunk:', error)
    }
  }

  return deduplicateTasks(allTasks)
}

function deduplicateTasks(tasks: ExtractedTask[]): ExtractedTask[] {
  const seen = new Set<string>()
  const deduplicated: ExtractedTask[] = []

  for (const task of tasks) {
    const key = `${task.title.toLowerCase()}-${task.owner.toLowerCase()}`
    if (!seen.has(key)) {
      seen.add(key)
      deduplicated.push(task)
    }
  }

  return deduplicated
}
