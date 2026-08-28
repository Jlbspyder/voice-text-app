import { useCallback, useState, type SubmitEvent } from 'react'
import { Answer } from '../components/Answer/Answer'
import { LoadingIndicator } from '../components/LoadingIndicator/LoadingIndicator'
import { Transcript } from '../components/Transcript/Transcript'
import { VoiceButton } from '../components/VoiceButton/VoiceButton'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { askWithText } from '../services/voice.service'

export function AskPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [typedQuestion, setTypedQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
 
  const submitQuestion = useCallback(async (transcript: string) => {
    setIsLoading(true); setRequestError(null); setQuestion(''); setAnswer('')
    try { const result = await askWithText(transcript); setQuestion(result.question); setAnswer(result.answer) }
    catch (cause) { setRequestError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.') }
    finally { setIsLoading(false) }
  }, [])
  const { isRecording, startRecording, stopRecording, error: recorderError } = useSpeechRecognition(submitQuestion)
  
  const beginRecording = useCallback(() => {
    setRequestError(null)
    startRecording()
  }, [startRecording])
  
  const submitTypedQuestion = useCallback((event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const questionToSubmit = typedQuestion.trim()
    if (!questionToSubmit || isLoading || isRecording) return
    void submitQuestion(questionToSubmit)
  }, [isLoading, isRecording, submitQuestion, typedQuestion])
  
  const hasResult = Boolean(question && answer)
  const error = recorderError ?? requestError

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f2f0e8] px-5 py-8 sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full bg-[#d6dfcf] blur-3xl" /><div className="pointer-events-none absolute -bottom-44 -left-32 h-96 w-96 rounded-full bg-[#e6d8c3] blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col">
        <header className="flex items-center justify-between"><a href="/" className="font-display text-lg font-extrabold tracking-tight text-[#1d3828]">JLB<span className="text-[#b35e46]">.</span></a><span className="rounded-full border border-[#d4d1c6] bg-white/45 px-3 py-1 text-xs font-semibold text-[#657168]">VOICE ASSISTANT</span></header>
        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-[#617468]">Ask out loud</p>
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-.04em] text-[#15251b] sm:text-6xl">Your curiosity,<br /><span className="italic text-[#467159]">answered.</span></h1>
          <p className="mt-5 max-w-md leading-7 text-[#667169]">Tap the microphone, ask anything, then tap again when you’re finished.</p>
          <div className="mt-10"><VoiceButton isRecording={isRecording} isLoading={isLoading} onStart={beginRecording} onStop={stopRecording} /></div>
          <p className="mt-5 min-h-6 text-sm font-medium text-[#526159]">{isRecording ? 'Recording — tap to finish' : isLoading ? 'Thinking…' : 'Tap to speak'}</p>
          <div className="my-7 flex w-full max-w-xl items-center gap-4 text-xs font-bold uppercase tracking-[.18em] text-[#8a918b] before:h-px before:flex-1 before:bg-[#d5d3ca] after:h-px after:flex-1 after:bg-[#d5d3ca]">or type</div>
          <form className="w-full max-w-xl" onSubmit={submitTypedQuestion}>
            <label htmlFor="typed-question" className="sr-only">Type your question</label>
            <textarea
              id="typed-question"
              value={typedQuestion}
              onChange={(event) => setTypedQuestion(event.target.value)}
              maxLength={4000}
              rows={3}
              disabled={isLoading || isRecording}
              placeholder="Type your question here..."
              className="w-full resize-none rounded-3xl border border-[#d4d1c6] bg-white/70 px-5 py-4 text-left text-[#18271e] shadow-sm outline-none transition placeholder:text-[#929890] focus:border-[#6f927c] focus:ring-4 focus:ring-[#b9d0c0]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-[#81877f]">{typedQuestion.length}/4000</span>
              <button type="submit" disabled={!typedQuestion.trim() || isLoading || isRecording} className="rounded-full bg-[#24583c] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1b4931] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#91b89e] disabled:cursor-not-allowed disabled:opacity-50">Ask question</button>
            </div>
          </form>
          <div className="mt-9 w-full rounded-4xl border border-white/80 bg-white/65 p-6 text-left shadow-[0_24px_70px_rgba(57,67,59,.10)] backdrop-blur-md sm:p-9">
            {isLoading && <LoadingIndicator />}
            {!isLoading && hasResult && <><Transcript question={question} /><Answer answer={answer} /></>}
            {!isLoading && !hasResult && !error && <p className="py-7 text-center text-sm leading-6 text-[#7b837e]">Your transcribed question and answer will appear here.</p>}
            {error && !isLoading && <div role="alert" className="rounded-2xl border border-[#e8b9ad] bg-[#fff2ed] px-5 py-4 text-sm leading-6 text-[#8b3e31]">{error}</div>}
          </div>
        </section>
        <footer className="text-center text-xs text-[#81877f]">Only your question is sent to the answer service.</footer>
      </div>
    </main>
  )
}
