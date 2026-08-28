export function Answer({ answer }: { answer: string }) {
  return <section className="pt-7" aria-labelledby="answer-heading"><p id="answer-heading" className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#6c776f]">Answer</p><p className="text-base leading-8 text-[#3b4940] sm:text-lg">{answer}</p></section>
}
