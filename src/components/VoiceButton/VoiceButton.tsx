interface VoiceButtonProps { isRecording: boolean; isLoading: boolean; onStart: () => void; onStop: () => void }

export function VoiceButton({ isRecording, isLoading, onStart, onStop }: VoiceButtonProps) {
  return (
    <button type="button" onClick={isRecording ? onStop : onStart} disabled={isLoading} aria-label={isRecording ? 'Stop recording' : 'Start recording'} className={`group relative grid h-28 w-28 place-items-center rounded-full text-white shadow-[0_18px_45px_rgba(31,73,52,.28)] transition duration-300 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#91b89e] disabled:cursor-wait disabled:opacity-60 sm:h-32 sm:w-32 ${isRecording ? 'bg-[#b84c3d] hover:bg-[#a54235]' : 'bg-[#24583c] hover:-translate-y-1 hover:bg-[#1b4931]'}`}>
      {isRecording ? <span className="h-8 w-8 rounded-md bg-white" aria-hidden="true" /> : <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="2.5" width="8" height="13" rx="4" /><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5v3M8.5 21.5h7" /></svg>}
      {isRecording && <span className="absolute inset-[-10px] animate-ping rounded-full border border-[#b84c3d]/40" />}
    </button>
  )
}
