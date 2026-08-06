"use client";

import { useContext } from "react";
import { PracticeQuestionContext } from "../context/PracticeQuestionProvider";

export default function usePracticeQuestions() {

    const context =
    useContext(PracticeQuestionContext);

    if (!context) {

        throw new Error(
            "usePracticeQuestions must be used inside PracticeQuestionProvider"
        );

    }

    return context;

}