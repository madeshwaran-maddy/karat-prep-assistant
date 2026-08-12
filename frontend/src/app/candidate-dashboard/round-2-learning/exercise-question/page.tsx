import { loadExerciseQuestions } from "./lib/excelReader";
import ExerciseQuestions from "./components/ExerciseQuestions";

export default function ExerciseQuestionsPage() {
  const questions = loadExerciseQuestions();

  if (questions.length === 0) {
    return (
      <div className="p-8 text-red-600">
        No questions found in Excel file.
      </div>
    );
  }

  const randomIndex = Math.floor(
    Math.random() * questions.length
  );

  const randomQuestion = questions[randomIndex];

  return (
    <ExerciseQuestions
      question={randomQuestion}
      questions={questions}
    />
  );
}