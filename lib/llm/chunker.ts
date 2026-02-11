const MAX_CHUNK_SIZE = 2000 // characters (rough approximation of tokens)
const OVERLAP = 200 // characters overlap between chunks

export function splitTranscript(transcript: string): string[] {
  if (transcript.length <= MAX_CHUNK_SIZE) {
    return [transcript]
  }

  const chunks: string[] = []
  let startIndex = 0

  while (startIndex < transcript.length) {
    let endIndex = startIndex + MAX_CHUNK_SIZE

    // Don't split in the middle of a sentence
    if (endIndex < transcript.length) {
      // Look for the last period, question mark, or newline before the end
      const lastPeriod = transcript.lastIndexOf('. ', endIndex)
      const lastQuestion = transcript.lastIndexOf('? ', endIndex)
      const lastNewline = transcript.lastIndexOf('\n', endIndex)

      const breakPoint = Math.max(lastPeriod, lastQuestion, lastNewline)
      if (breakPoint > startIndex) {
        endIndex = breakPoint + 1
      }
    }

    chunks.push(transcript.substring(startIndex, endIndex).trim())

    // Move start index back by OVERLAP to ensure context continuity
    startIndex = endIndex - OVERLAP
  }

  return chunks
}

export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token on average
  return Math.ceil(text.length / 4)
}
