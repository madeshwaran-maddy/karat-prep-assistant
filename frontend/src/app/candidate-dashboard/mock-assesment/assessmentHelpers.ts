import { AssessmentQuestion } from "./mockAssessment";

export function getAssessmentQuestions(
  round1Questions: AssessmentQuestion[],
  round2Question: AssessmentQuestion
): AssessmentQuestion[] {
  return [...round1Questions, round2Question];
}

export function getNextQuestion(
  questions: AssessmentQuestion[],
  currentQuestionNo: number,
  currentRound: number
): AssessmentQuestion | null {
  const currentIndex = questions.findIndex(
    (question) =>
      question.questionNo === currentQuestionNo &&
      question.round === currentRound
  );

  if (currentIndex === -1 || currentIndex === questions.length - 1) {
    return null;
  }

  return questions[currentIndex + 1];
}

export function isRound1Question(
  question: AssessmentQuestion
): question is Extract<AssessmentQuestion, { round: 1 }> {
  return question.round === 1;
}

export function isRound2Question(
  question: AssessmentQuestion
): question is Extract<AssessmentQuestion, { round: 2 }> {
  return question.round === 2;
}
