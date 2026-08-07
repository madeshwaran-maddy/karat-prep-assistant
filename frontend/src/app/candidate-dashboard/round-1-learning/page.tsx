import Link from "next/link";

export default function RoundOneLearning() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-slate-500">
            Round 1 Learning
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Review learning sections and access debugging practice anytime.
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
              <span className="text-xl">📚</span>
            </div>
           {/* <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Completed 
            </span>*/}
          </div>
          <h2 className="mt-6 text-xl font-semibold text-slate-950">Concepts</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Java fundamentals and topic explanations completed successfully.
          </p>
          <Link
            href="/candidate-dashboard/round-1-learning/concepts"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start
          </Link>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-50 text-amber-700">
              <span className="text-xl">❓</span>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              In Progress
            </span>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-slate-950">Practice Questions</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Questions with answers are currently being reviewed.
          </p>
          <Link
            href="/candidate-dashboard/round-1-learning/practice-questions"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start
          </Link>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/40 lg:col-span-2 lg:flex lg:justify-center">
          <div className="w-full max-w-[32rem]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-50 text-sky-700">
                <span className="text-xl">&lt;/&gt;</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-950">Debugging Drills</h2>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              Practice concept-based buggy code scenarios whenever needed.
            </p>
            <Link
              href="/candidate-dashboard/round-1-learning/debugging-drill"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Start
            </Link>
          </div>
        </article>

      </section>
    </div>
  );
}
