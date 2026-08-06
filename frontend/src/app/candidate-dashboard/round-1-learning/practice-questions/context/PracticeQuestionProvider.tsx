"use client";

import {
    createContext,
    ReactNode,
    useMemo,
    useState
} from "react";

import PracticeQuestionService from "../services/PracticeQuestionService";

import {
    PracticeData,
    Topic
} from "../types/practice";

interface ContextType {

    data: PracticeData;

    section: keyof PracticeData;

    topicId: string;

    questionIndex: number;

    topic?: Topic;

    setSection: (
        value: keyof PracticeData
    ) => void;

    setTopicId: (
        value: string
    ) => void;

    setQuestionIndex: (
        value: number
    ) => void;

}

export const PracticeQuestionContext =
createContext<ContextType | null>(null);

export default function PracticeQuestionProvider({

    children

}:{

    children:ReactNode

}){

    const data =
    PracticeQuestionService.getData();

    const [section,setSection] =
    useState<keyof PracticeData>(
        "collections"
    );

    const [topicId,setTopicId] =
    useState("list");

    const [questionIndex,setQuestionIndex] =
    useState(0);

    const topic = useMemo(()=>{

        return PracticeQuestionService.getTopic(
            section,
            topicId
        );

    },[
        section,
        topicId
    ]);

    return(

<PracticeQuestionContext.Provider

value={{

data,

section,

topicId,

questionIndex,

topic,

setSection,

setTopicId,

setQuestionIndex

}}

>

{children}

</PracticeQuestionContext.Provider>

    );

}