import type { ApiError, ConversationResponse } from '../types/conversation'

export async function askWithText(question: string): Promise<ConversationResponse> {
  const response = await fetch('/api/ask-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const data = (await response.json()) as ConversationResponse | ApiError
  if (!response.ok) throw new Error('error' in data ? data.error : 'The request could not be completed.')
  return data as ConversationResponse
}
