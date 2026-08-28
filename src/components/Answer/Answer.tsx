import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Answer({ answer }: { answer: string }) {
  return (
    <section className="pt-7" aria-labelledby="answer-heading">
      <p id="answer-heading" className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#6c776f]">Answer</p>
      <div className="text-base leading-8 text-[#3b4940] sm:text-lg">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h2 className="mb-3 mt-6 font-display text-2xl font-bold text-[#18271e] first:mt-0">{children}</h2>,
            h2: ({ children }) => <h3 className="mb-3 mt-6 font-display text-xl font-bold text-[#18271e] first:mt-0">{children}</h3>,
            h3: ({ children }) => <h4 className="mb-2 mt-5 font-display text-lg font-bold text-[#18271e] first:mt-0">{children}</h4>,
            p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>,
            ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>,
            strong: ({ children }) => <strong className="font-bold text-[#24372b]">{children}</strong>,
            blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-[#91b89e] pl-4 italic">{children}</blockquote>,
            table: ({ children }) => <div className="my-5 overflow-x-auto rounded-xl border border-[#d8d5c9]"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
            th: ({ children }) => <th className="border-b border-[#d8d5c9] bg-[#edf1eb] px-4 py-3 font-bold text-[#24372b]">{children}</th>,
            td: ({ children }) => <td className="border-b border-[#e3e1d9] px-4 py-3 align-top last:border-b-0">{children}</td>,
            code: ({ children }) => <code className="rounded bg-[#e7e9e3] px-1.5 py-0.5 text-sm text-[#294936]">{children}</code>,
            a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-[#24583c] underline decoration-[#91b89e] underline-offset-2">{children}</a>,
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </section>
  )
}
