import { ExerciseQuestion } from "../lib/questionTypes";

interface Props {
  questions: ExerciseQuestion[];
  currentQuestion: ExerciseQuestion;
}

export default function ExerciseSidebar({
  questions,
  currentQuestion,
}: Props) {
  return (
    <aside className="min-h-[650px] rounded-xl border border-gray-200 p-5">

      <h3 className="mb-6 text-xl font-bold text-gray-900">
        Exercise Menu
      </h3>

      <div className="space-y-3">

        {questions.map((question) => {
          const isActive =
            question.questionNo ===
            currentQuestion.questionNo;

          return (
            <div
              key={question.questionNo}
              className={`rounded-lg border px-4 py-3 ${
                isActive
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600"
              }`}
            >

              <div className="font-semibold">
                Problem {question.questionNo}
              </div>

              <div className="mt-1 text-sm">
                {question.title}
              </div>

            </div>
          );
        })}

      </div>

    </aside>
  );
}