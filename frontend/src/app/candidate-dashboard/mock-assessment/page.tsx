export default function MockAssessment() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.2em] text-slate-500">
            Mock Assessment
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Mock assessment overview will appear here.
          </h1>
        </div>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        This page is a placeholder for mock assessment content within the candidate dashboard.
      </p>
    </div>
  );
}
