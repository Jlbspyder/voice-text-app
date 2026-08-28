export function LoadingIndicator() {
  return <div className="flex items-center justify-center gap-3 py-8 text-[#52645a]" role="status"><span className="flex h-6 items-center gap-1" aria-hidden="true">{[12, 20, 28, 16].map((height) => <span key={height} className="sound-bar w-1 rounded-full bg-[#3e7253]" style={{ height }} />)}</span><span>Preparing your answer…</span></div>
}
