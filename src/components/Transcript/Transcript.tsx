export function Transcript({ question }: { question: string }) {
  return <section className="border-b border-[#d8d5c9] pb-7" aria-labelledby="question-heading"><p id="question-heading" className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#6c776f]">You asked</p><p className="font-display text-xl font-semibold leading-relaxed text-[#18271e] sm:text-2xl">“{question}”</p></section>
}
