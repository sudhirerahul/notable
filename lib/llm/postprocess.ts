import * as chrono from 'chrono-node'

export function parseDueDate(dateString: string, meetingContext?: Date): Date | null {
  try {
    // Use chrono to parse natural language dates
    const referenceDate = meetingContext || new Date()
    const parsed = chrono.parseDate(dateString, referenceDate)
    return parsed
  } catch (error) {
    console.error('Error parsing date:', dateString, error)
    return null
  }
}

export function calculateConfidence(logprobs: any): number {
  if (!logprobs || !logprobs.content) return 0.5

  try {
    const probabilities = logprobs.content.map((item: any) => Math.exp(item.logprob))
    const avgProbability = probabilities.reduce((a: number, b: number) => a + b, 0) / probabilities.length

    return Math.min(1.0, Math.max(0.0, avgProbability))
  } catch (error) {
    return 0.5 // Default confidence on error
  }
}

export function mapOwnerToUser(ownerName: string, knownUsers: { name: string; email: string }[]): string {
  // Attempt to match owner name to known users
  const normalized = ownerName.toLowerCase().trim()

  for (const user of knownUsers) {
    const userName = user.name.toLowerCase()
    if (userName.includes(normalized) || normalized.includes(userName)) {
      return user.email
    }
  }

  return ownerName // Return original if no match found
}
