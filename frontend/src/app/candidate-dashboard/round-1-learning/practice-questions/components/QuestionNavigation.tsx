"use client";

import usePracticeQuestions from "../hooks/usePracticeQuestions";

export default function QuestionNavigation() {

    const {
        topic,
        questionIndex,
        setQuestionIndex
    } = usePracticeQuestions();

    if (!topic)
        return null;

    const total =
        topic.questions.length;

    return (

        <div className="flex items-center justify-between mt-10">

            <button

                disabled={questionIndex === 0}

                onClick={() =>
                    setQuestionIndex(questionIndex - 1)
                }

                className="px-5 py-2 rounded-lg border disabled:opacity-40"

            >

                ← Previous Question

            </button>

            <div className="font-semibold">

                Question {questionIndex + 1} of {total}

            </div>

            <button

                disabled={questionIndex === total - 1}

                onClick={() =>
                    setQuestionIndex(questionIndex + 1)
                }

                className="px-5 py-2 rounded-lg bg-green-600 text-white disabled:bg-gray-300"

            >

                Next Question →

            </button>

        </div>

    );

}