import Link from "next/link";

export default function RoundTwoLearning() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-slate-500">
            Round 2 Learning
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Choose format guidance or implementation practice for Round 2.
          </h1>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          Last updated: Today
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
              <span className="text-xl">📘</span>
            </div>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-slate-950">Format and Practice Questions</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Review Round 2 format guidance, question structure, and answer examples.
          </p>
          <Link
            href="/candidate-dashboard/round-2-learning/format-practice-questions"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open
          </Link>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-50 text-blue-700">
              <span className="text-xl">💻</span>
            </div>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-slate-950">Exercise Questions</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Practice implementation-based exercises and verify your answers.
          </p>
          <Link
            href="/candidate-dashboard/round-2-learning/practice-questions"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start
          </Link>
        </article>
      </section>
    </div>
  );
}
