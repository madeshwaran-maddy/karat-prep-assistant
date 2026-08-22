import { Concept } from "../types";
import BulletSection from "./BulletSection";
import CodeBlock from "./CodeBlock";

interface Props {
  concept: Concept;
}

export default function ConceptContent({
  concept,
}: Props) {
  const sectionId = (title: string, index: number) =>
    `${concept.id}-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  const wordCount = [
    concept.summary ?? "",
    ...concept.explanation,
    ...(concept.detailSections ?? []).flatMap((section) => [
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
      section.note ?? "",
      section.codeExample ?? "",
    ]),
  ].join(" ").split(/\s+/).filter(Boolean).length;

  const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <article className="space-y-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 sm:p-8 lg:p-10">
      <header className="border-b border-slate-200 pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
            Beginner-friendly notes
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {readMinutes} min read
          </span>
          {concept.detailSections && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              {concept.detailSections.length} simple sections
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {concept.title}
        </h1>

        {concept.summary && (
          <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-600">
            {concept.summary}
          </p>
        )}
      </header>

      {concept.learningObjectives && concept.learningObjectives.length > 0 && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6">
          <h2 className="text-xl font-bold text-blue-950">After this topic, you can</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {concept.learningObjectives.map((objective) => (
              <li key={objective} className="flex gap-3 leading-7 text-blue-950">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {concept.detailSections && concept.detailSections.length > 0 && (
        <nav aria-label="On this page" className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600">
            Read in this order
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with the meaning, then properties, internal working, methods,
            example, and finally the Karat-ready answer.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {concept.detailSections.map((section, index) => (
              <a
                key={`${section.title}-${index}`}
                href={`#${sectionId(section.title, index)}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </div>
        </nav>
      )}

      <section>
        <BulletSection title="First remember these points" items={concept.explanation} />
      </section>

      {concept.detailSections?.map((section, index) => (
        <section
          id={sectionId(section.title, index)}
          key={`${section.title}-${index}`}
          className="scroll-mt-6 rounded-3xl border border-slate-200 bg-slate-50/30 p-6 sm:p-7"
        >
          <div className="mb-5 flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
              {index + 1}
            </span>
            <h2 className="text-2xl font-bold leading-9 text-slate-950">
              {section.title}
            </h2>
          </div>

          {section.paragraphs && (
            <div className="space-y-4 text-[16px] leading-8 text-slate-700">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}

          {section.bullets && (
            <ul className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-5 text-slate-700">
              {section.bullets.map((item) => (
                <li key={item} className="flex gap-3 leading-7">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {section.table && (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
              {section.table.title && (
                <h3 className="border-b border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-800">
                  {section.table.title}
                </h3>
              )}
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    {section.table.headers.map((header) => (
                      <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {section.table.rows.map((row, rowIndex) => (
                    <tr key={`${row.join("-")}-${rowIndex}`} className="align-top odd:bg-white even:bg-slate-50/70">
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`} className="max-w-md px-4 py-3 leading-6 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.note && (
            <div className="mt-6 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-5 leading-7 text-amber-950">
              <span className="font-bold">Keep in mind: </span>{section.note}
            </div>
          )}

          {section.codeExample && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-bold text-slate-900">Worked example</h3>
              <CodeBlock code={section.codeExample} />
            </div>
          )}
        </section>
      ))}

      {concept.complexityTable && (
        <section className="border-t border-slate-200 pt-9">
          <h2 className="text-2xl font-bold text-slate-950">
            {concept.complexityTable.title ?? "Complexity and behavior"}
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  {concept.complexityTable.headers.map((header) => (
                    <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {concept.complexityTable.rows.map((row, rowIndex) => (
                  <tr key={`${row.join("-")}-${rowIndex}`} className="odd:bg-white even:bg-slate-50/70">
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`} className="px-4 py-3 leading-6 text-slate-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="grid gap-6 border-t border-slate-200 pt-9 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <BulletSection title="Key Concepts — Quick Revision" items={concept.keyConcepts} />
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6">
          <BulletSection title="Common Mistakes" items={concept.commonMistakes} />
        </div>
      </section>

      {!concept.detailSections?.some((section) => section.codeExample) && (
        <section className="border-t border-slate-200 pt-9">
          <h2 className="mb-4 text-2xl font-bold">Complete coding example</h2>
          <CodeBlock code={concept.codeExample} />
        </section>
      )}

      <section className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6">
        <BulletSection title="Debugging Scenarios" items={concept.debuggingScenario} />
      </section>

      {concept.interviewChecklist && concept.interviewChecklist.length > 0 && (
        <section className="rounded-2xl bg-slate-950 p-7 text-white">
          <h2 className="text-2xl font-bold">Interview readiness checklist</h2>
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {concept.interviewChecklist.map((item) => (
              <li key={item} className="flex gap-3 leading-7 text-slate-200">
                <span aria-hidden="true" className="font-bold text-emerald-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {concept.officialReferences && concept.officialReferences.length > 0 && (
        <footer className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-bold text-slate-900">Official Java 17 references</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {concept.officialReferences.map((reference) => (
              <a
                key={reference.url}
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"
              >
                {reference.title} ↗
              </a>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
