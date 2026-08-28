import type { ApiError, ConversationResponse, ConversationTurn } from '../types/conversation'

export async function askWithText(question: string, turns: ConversationTurn[]): Promise<ConversationResponse> {
  const history = turns.slice(-4).map((turn) => ({
    question: turn.question.slice(0, 4000),
    answer: turn.answer.slice(0, 4000),
  }))
  const response = await fetch('/api/ask-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  })
  const data = (await response.json()) as ConversationResponse | ApiError
  if (!response.ok) throw new Error('error' in data ? data.error : 'The request could not be completed.')
  return data as ConversationResponse
}
