"use client";

import usePracticeQuestions from "../hooks/usePracticeQuestions";
import PracticeQuestionService from "../services/PracticeQuestionService";

export default function TopicNavigation() {

    const {

        section,
        topicId,
        setSection,
        setTopicId,
        setQuestionIndex

    } = usePracticeQuestions();

    const previous =
        PracticeQuestionService.getPreviousTopic(
            section,
            topicId
        );

    const next =
        PracticeQuestionService.getNextTopic(
            section,
            topicId
        );

    function gotoPrevious() {

        if (!previous)
            return;

        setSection(previous.section);
        setTopicId(previous.topic.id);
        setQuestionIndex(0);

    }

    function gotoNext() {

        if (!next)
            return;

        setSection(next.section);
        setTopicId(next.topic.id);
        setQuestionIndex(0);

    }

    return (

        <div className="flex justify-between mt-10">

            <button

                disabled={!previous}

                onClick={gotoPrevious}

                className="px-5 py-2 rounded-lg border disabled:opacity-40"

            >

                ← Previous Topic

            </button>

            <button

                disabled={!next}

                onClick={gotoNext}

                className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300"

            >

                Next Topic →

            </button>

        </div>

    );

}