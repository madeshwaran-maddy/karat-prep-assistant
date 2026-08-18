interface Props {
  title: string;
  questionNo: number;
  questionTitle?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  current: number;
  total: number;
}

export default function QuestionHeader({
  title,
  questionNo,
  questionTitle,
  difficulty,
  current,
  total,
}: Props) {
  const difficultyStyle = {
    Easy: "bg-emerald-100 text-emerald-800",
    Medium: "bg-amber-100 text-amber-800",
    Hard: "bg-rose-100 text-rose-800",
  } as const;

  return (
    <div className="border-b pb-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          Question {current} of {total}
        </span>
        {difficulty && (
          <span className={`rounded-full px-3 py-1 ${difficultyStyle[difficulty]}`}>
            {difficulty}
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {title}
      </h1>

      <p className="mt-2 text-lg font-semibold text-slate-700">
        {questionTitle ?? `Practice Question ${questionNo}`}
      </p>

    </div>
  );
}
