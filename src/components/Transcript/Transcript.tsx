export function Transcript({ question, headingId = 'question-heading' }: { question: string; headingId?: string }) {
  return <section className="border-b border-[#d8d5c9] pb-7" aria-labelledby={headingId}><p id={headingId} className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#6c776f]">You asked</p><p className="font-display text-xl font-semibold leading-relaxed text-[#18271e] sm:text-2xl">“{question}”</p></section>
}
