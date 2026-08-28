export interface ConversationTurn {
  id: string;
  question: string;
  answer: string;
}

export interface ConversationResponse {
  question: string;
  answer: string;
}
export interface ApiError {
  error: string;
}
