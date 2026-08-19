"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  loadDrills,
  generateQuestion,
  evaluateQuestion,
} from "../services/debuggingApi";

import {
  Drill,
  EvaluateResponse,
  GenerateResponse,
} from "../types/drill";

import { useDrillStore } from "../store/drillStore";
import { useCandidateLanguage } from "../../../../../components/CandidateLanguageProvider";

export function useDrill() {
  const { language } = useCandidateLanguage();
  const {
    collections,
    selectedDrill,
    generatedQuestion,
    editorCode,
    evaluation,
    loading,
    evaluating,
    resultDrawerOpen,
    setCollections,
    setSelectedDrill,
    setGeneratedQuestion,
    setEditorCode,
    setAnalysisText,
    analysisText,
    setEvaluation,
    setLoading,
    setEvaluating,
    openDrawer,
    closeDrawer,
    reset,
  } = useDrillStore();

  const initializedRef = useRef(false);
  const activeGenerationRef = useRef<string | null>(null);
  const topicQuestionCountsRef = useRef<Record<string, number>>({});
  const [questionProgress, setQuestionProgress] = useState({ topicId: "", count: 0 });
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(4 * 60);
  const submitSolutionRef = useRef<((autoSubmit?: boolean) => Promise<void>) | null>(null);
  const submittingQuestionRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const hasSubmittedCurrentQuestion = Boolean(
    generatedQuestion?.id && submittedQuestionIds.includes(generatedQuestion.id)
  );

  const generate = useCallback(
    async (drill?: Drill, resetCount = false) => {
      const currentDrill = drill || selectedDrill;

      if (!currentDrill) {
        return;
      }

      const requestKey = currentDrill.id;
      if (activeGenerationRef.current === requestKey) {
        return;
      }

      const topicId = currentDrill.id;
      if (resetCount) {
        topicQuestionCountsRef.current[topicId] = 0;
        setQuestionProgress({ topicId, count: 0 });
      } else {
        const currentCount = topicQuestionCountsRef.current[topicId] ?? 0;
        if (currentCount >= 3) {
          return;
        }
      }

      activeGenerationRef.current = requestKey;

      try {
        setLoading(true);
        setError(null);
        setGeneratedQuestion(null);
        setEditorCode("");
        // clear candidate analysis when a new question is generated
        setAnalysisText("");

        const response: GenerateResponse = await generateQuestion({
          id: currentDrill.id,
          language: language.id,
        });

        setGeneratedQuestion(response);
        setEditorCode(response.code);

        const nextCount = (topicQuestionCountsRef.current[topicId] ?? 0) + 1;
        topicQuestionCountsRef.current[topicId] = nextCount;
        setQuestionProgress({ topicId, count: nextCount });
      } catch (error) {
        console.error("Generation failed", error);
        setError(error instanceof Error ? error.message : "Unable to generate a debugging question.");
      } finally {
        if (activeGenerationRef.current === requestKey) {
          activeGenerationRef.current = null;
        }
        setLoading(false);
      }
    },
    [selectedDrill, language.id, setLoading, setGeneratedQuestion, setEditorCode, setAnalysisText]
  );

  const initializeDrills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadDrills(language.id);
      setCollections(data);

      const firstCategory = Object.keys(data)[0];
      if (firstCategory) {
        const firstDrill = data[firstCategory][0];
        if (firstDrill) {
          setSelectedDrill(firstDrill);
          await generate(firstDrill, true);
        }
      }
    } catch (error) {
      console.error("Failed loading drills", error);
      setError(error instanceof Error ? error.message : "Unable to load debugging drills.");
    } finally {
      setLoading(false);
    }
  }, [language.id, setCollections, setSelectedDrill, setLoading, generate]);

  const selectDrill = useCallback(
    async (drill: Drill) => {
      setSelectedDrill(drill);
      setEvaluation(null);
      closeDrawer();
      await generate(drill, true);
    },
    [closeDrawer, setEvaluation, setSelectedDrill, generate]
  );

  const nextQuestion = useCallback(async () => {
    if (!selectedDrill) {
      return;
    }

    const currentCount = topicQuestionCountsRef.current[selectedDrill.id] ?? 0;
    if (currentCount >= 3) {
      return;
    }

    await generate(selectedDrill);
  }, [generate, selectedDrill]);

  const updateCode = useCallback((code: string) => {
    setEditorCode(code);
  }, [setEditorCode]);

  const updateAnalysis = useCallback((text: string) => {
    setAnalysisText(text);
  }, [setAnalysisText]);

  const submitSolution = useCallback(async (autoSubmit = false) => {
    if (!selectedDrill || !generatedQuestion) {
      return;
    }

    const questionId = generatedQuestion.id;
    if (
      (questionId && submittedQuestionIds.includes(questionId)) ||
      submittingQuestionRef.current === questionId
    ) {
      return;
    }

    if (!autoSubmit && (!analysisText || !analysisText.trim())) {
      return;
    }

    try {
      if (!autoSubmit && timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      submittingQuestionRef.current = questionId || "unknown";
      setEvaluating(true);
      if (questionId) {
        setSubmittedQuestionIds((current) => [...current, questionId]);
      }

      const response: EvaluateResponse = await evaluateQuestion({
        id: selectedDrill.id,
        questionId: generatedQuestion.id,
        assessmentId: typeof window !== "undefined" ? localStorage.getItem("debuggingAssessmentId") || undefined : undefined,
        userAnalysis: analysisText,
        userCode: editorCode,
        originalCode: generatedQuestion.code,
      });

      setEvaluation(response);
      openDrawer();
    } catch (error) {
      console.error("Evaluation failed", error);
      submittingQuestionRef.current = null;
      if (questionId) {
        setSubmittedQuestionIds((current) => current.filter((item) => item !== questionId));
      }
    } finally {
      setEvaluating(false);
    }
  }, [selectedDrill, generatedQuestion, analysisText, editorCode, setEvaluating, setEvaluation, openDrawer, submittedQuestionIds]);

  useEffect(() => {
    submitSolutionRef.current = submitSolution;
  }, [submitSolution]);

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSecondsRemaining(4 * 60);

    if (!generatedQuestion) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((seconds) => {
        if (seconds <= 1) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [generatedQuestion?.id]);

  useEffect(() => {
    if (secondsRemaining === 0 && generatedQuestion && !hasSubmittedCurrentQuestion) {
      void submitSolutionRef.current?.(true);
    }
  }, [secondsRemaining, generatedQuestion, hasSubmittedCurrentQuestion]);

  const closeResult = useCallback(() => {
    closeDrawer();
  }, [closeDrawer]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    void initializeDrills();
  }, [initializeDrills]);

  return {
    collections,
    selectedDrill,
    generatedQuestion,
    editorCode,
    analysisText,
    error,
    evaluation,
    loading,
    evaluating,
    resultDrawerOpen,
    initializeDrills,
    selectDrill,
    generateQuestion: generate,
    nextQuestion,
    questionProgress,
    secondsRemaining,
    hasSubmittedCurrentQuestion,
    updateCode,
    updateAnalysis,
    submitSolution,
    closeResult,
    reset,
  };
}
