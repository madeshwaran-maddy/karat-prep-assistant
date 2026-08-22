"use client";

import {
    createContext,
    ReactNode,
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";

import PracticeQuestionService from "../services/PracticeQuestionService";
import { usePracticeQuestionProgress } from "../hooks/usePracticeQuestionProgress";

import {
    PracticeData,
    Topic
} from "../types/practice";
import { QuestionProgress, TopicProgressSummary } from "../types/progress";
import { useCandidateLanguage } from "../../../../../components/CandidateLanguageProvider";

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

    // Progress tracking
    progress: Record<string, QuestionProgress>;
    summaryByTopic: Record<string, TopicProgressSummary>;
    totalTimeSpent: number;
    progressLoading: boolean;
    startQuestion: (section: string, topicId: string, questionNo: number, language?: string) => Promise<void>;
    completeQuestion: (section: string, topicId: string, questionNo: number, timeSpent: number) => Promise<void>;
    updateTimeSpent: (section: string, topicId: string, questionNo: number, timeSpent: number) => Promise<void>;

}

export const PracticeQuestionContext =
createContext<ContextType | null>(null);

function getDefaultTopicSelection(
    data: PracticeData,
    progress: Record<string, QuestionProgress>
): { section: keyof PracticeData; topicId: string; questionIndex: number } {
    const sectionOrder = Object.keys(data);
    console.log("📋 Section order:", sectionOrder);

    // Step 1: Find first section with any in-progress activity
    const inProgressSection = sectionOrder.find((section) => {
        const hasInProgress = Object.values(progress).some(
            (item) => item.section === section && item.status === "in_progress"
        );
        console.log(`  Checking section "${section}" for in-progress: ${hasInProgress}`);
        return hasInProgress;
    });

    console.log("✅ In-progress section found:", inProgressSection);

    if (inProgressSection) {
        // Find first in-progress topic and the specific question
        for (const topic of data[inProgressSection]) {
            const topicEntries = Object.values(progress).filter(
                (item) => item.section === inProgressSection && item.topicId === topic.id
            );

            const inProgressQuestion = topicEntries.find((item) => item.status === "in_progress");
            
            if (inProgressQuestion) {
                const questionIndex = topic.questions.findIndex(
                    (q) => q.questionNo === inProgressQuestion.questionNo
                );
                console.log("✅ Found in-progress question:", {
                    topicId: topic.id,
                    questionNo: inProgressQuestion.questionNo,
                    questionIndex,
                });
                return { section: inProgressSection, topicId: topic.id, questionIndex: Math.max(0, questionIndex) };
            }
        }
    }

    // Step 2: Find first section with any progress activity (completed or partially done)
    const partialSection = sectionOrder.find((section) => {
        const hasProgress = Object.values(progress).some(
            (item) => item.section === section
        );
        console.log(`  Checking section "${section}" for any progress: ${hasProgress}`);
        return hasProgress;
    });

    console.log("✅ Found partial section with progress:", partialSection);
    console.log("All progress entries by section:", progress);

    if (partialSection) {
        console.log("✅ Found partial section with progress:", partialSection);
        console.log("Topics available in", partialSection, ":", data[partialSection].map(t => t.id));
        
        // Find first incomplete topic (has completed questions but not all completed)
        for (const topic of data[partialSection]) {
            const topicEntries = Object.values(progress).filter(
                (item) => item.section === partialSection && item.topicId === topic.id
            );

            const completedCount = topicEntries.filter((item) => item.status === "completed").length;
            const totalCount = topic.questions.length;

            console.log(`  Topic "${topic.id}": ${completedCount}/${totalCount} completed, ${topicEntries.length} entries, entries:`, topicEntries);

            // If topic is partially completed or has started questions
            if (topicEntries.length > 0 && completedCount < totalCount) {
                console.log(`✅ Found incomplete topic: ${topic.id} (${completedCount}/${totalCount} completed)`);
                return { section: partialSection, topicId: topic.id, questionIndex: 0 };
            }
        }

        // If all topics in this section are fully completed, find first not-started in same section
        const firstNotStarted = data[partialSection].find((topic) => {
            const topicEntries = Object.values(progress).filter(
                (item) => item.section === partialSection && item.topicId === topic.id
            );
            return topicEntries.length === 0;
        });

        if (firstNotStarted) {
            console.log("✅ All topics completed in", partialSection, "- found first not-started:", firstNotStarted.id);
            return { section: partialSection, topicId: firstNotStarted.id, questionIndex: 0 };
        }
    }

    // Step 3: If no partial progress, find first not-started topic in order
    for (const section of sectionOrder) {
        const matchingTopic = data[section].find((topic) => {
            const topicEntries = Object.values(progress).filter(
                (item) => item.section === section && item.topicId === topic.id
            );

            if (topicEntries.length === 0) {
                console.log(`    Topic "${topic.id}" has no progress (not-started)`);
                return true;
            }

            const allNotStarted = topicEntries.every((item) => item.status === "not_started");
            console.log(`    Topic "${topic.id}" all not-started: ${allNotStarted}`);
            return allNotStarted;
        });

        if (matchingTopic) {
            console.log("✅ Matched not-started topic:", matchingTopic.id, "in section:", section);
            return { section, topicId: matchingTopic.id, questionIndex: 0 };
        }
    }

    // Step 4: Default to first section and first topic
    const firstSection = sectionOrder[0] ?? "";
    const firstTopic = data[firstSection]?.[0];

    console.log("⚠️  Falling back to default:", { section: firstSection, topicId: firstTopic?.id });

    return {
        section: firstSection,
        topicId: firstTopic?.id ?? "",
        questionIndex: 0,
    };
}

export default function PracticeQuestionProvider({

    children

}:{

    children:ReactNode

}){

    const { language } = useCandidateLanguage();
    const data = PracticeQuestionService.getData(language.id);

    const [section,setSection] =
    useState<string>(() => Object.keys(data)[0] ?? "");

    const [topicId,setTopicId] =
    useState(() => data[Object.keys(data)[0] ?? ""]?.[0]?.id ?? "");

    const [questionIndex,setQuestionIndex] =
    useState(0);
    const hasAppliedDefaultSelection = useRef(false);
    const lastLanguageIdRef = useRef(language.id);

    const topic = useMemo(()=>{

        return data[section]?.find((item) => item.id === topicId);

    },[
        data,
        section,
        topicId
    ]);

    // Progress tracking
    const {
        progress,
        summaryByTopic,
        totalTimeSpent,
        loading: progressLoading,
        fetchAllProgress,
        startQuestion: startQuestionAPI,
        completeQuestion: completeQuestionAPI,
        updateTimeSpent: updateTimeSpentAPI,
    } = usePracticeQuestionProgress();

    // Fetch progress on mount
    useEffect(() => {
        fetchAllProgress();
    }, [fetchAllProgress]);

    // Apply default topic selection once after progress loads
    useEffect(() => {
        if (lastLanguageIdRef.current !== language.id) {
            lastLanguageIdRef.current = language.id;
            hasAppliedDefaultSelection.current = false;
        }

        // Wait until progress is actually loaded (not loading AND has data or is empty)
        if (progressLoading) {
            console.log("Still loading progress, skipping selection...");
            return;
        }

        // Default selection is only for the initial load; user navigation and progress updates must persist.
        if (hasAppliedDefaultSelection.current) {
            console.log("Default selection already applied, skipping");
            return;
        }

        const progressCount = Object.values(progress).length;

        console.log("🔍 Applying default selection...");
        console.log("Progress data entries:", progressCount);
        const inProgressEntries = Object.values(progress).filter(
            (item) => item.status === "in_progress"
        );
        console.log("🎯 In-progress entries found:", inProgressEntries.length);

        const nextSelection = getDefaultTopicSelection(data, progress);
        console.log("🎯 Selected:", nextSelection);

        if (nextSelection.section !== section || nextSelection.topicId !== topicId || nextSelection.questionIndex !== questionIndex) {
            console.log("🎯 UPDATING selection from", { section, topicId, questionIndex }, "→", nextSelection);
            setSection(nextSelection.section);
            setTopicId(nextSelection.topicId);
            setQuestionIndex(nextSelection.questionIndex);
        }

        hasAppliedDefaultSelection.current = true;
    }, [language.id, progressLoading, progress, data, section, topicId, questionIndex]);

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

setQuestionIndex,

progress,

summaryByTopic,

totalTimeSpent,

progressLoading,

startQuestion: startQuestionAPI,

completeQuestion: completeQuestionAPI,

updateTimeSpent: updateTimeSpentAPI,

}}

>

{children}

</PracticeQuestionContext.Provider>

    );

}