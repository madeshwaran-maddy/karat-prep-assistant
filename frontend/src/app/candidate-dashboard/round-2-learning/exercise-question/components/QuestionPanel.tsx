import { ExerciseQuestion } from "../lib/questionTypes";

import JavaCodeEditor from "./JavaCodeEditor";

interface Props {
  question: ExerciseQuestion;
}

export default function QuestionPanel({
  question,
}: Props) {
  return (
    <main className="rounded-xl border border-gray-200 p-8">

      <h2 className="mb-6 text-3xl font-bold text-gray-900">
        Problem
      </h2>

      <JavaCodeEditor
        question={question}
      />

    </main>
  );
}