import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechResult {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechEvent extends Event {
  results: { length: number; [index: number]: SpeechResult }
}

interface SpeechErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechEvent) => void) | null
  onerror: ((event: SpeechErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognition() {
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

export function useSpeechRecognition(onComplete: (transcript: string) => void) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptRef = useRef('')
  const activeRef = useRef(false)

  useEffect(() => () => {
    activeRef.current = false
    recognitionRef.current?.abort()
  }, [])

  const startRecording = useCallback(() => {
    setError(null)
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'
    transcriptRef.current = ''
    activeRef.current = true
    recognitionRef.current = recognition

    recognition.onresult = (event) => {
      let transcript = ''
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript
      }
      transcriptRef.current = transcript.trim()
    }

    recognition.onerror = (event) => {
      activeRef.current = false
      setIsRecording(false)
      setError(
        event.error === 'not-allowed'
          ? 'Microphone access was denied. Enable it in your browser settings.'
          : event.error === 'no-speech'
            ? 'No speech was detected. Please try again.'
            : 'Speech recognition failed. Please try again.',
      )
    }

    recognition.onend = () => {
      const shouldSubmit = activeRef.current
      activeRef.current = false
      recognitionRef.current = null
      setIsRecording(false)
      if (!shouldSubmit) return
      if (transcriptRef.current) onComplete(transcriptRef.current)
      else setError('No speech was detected. Please try again.')
    }

    try {
      recognition.start()
      setIsRecording(true)
    } catch {
      activeRef.current = false
      setError('Speech recognition could not be started.')
    }
  }, [onComplete])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { isRecording, startRecording, stopRecording, error }
}
