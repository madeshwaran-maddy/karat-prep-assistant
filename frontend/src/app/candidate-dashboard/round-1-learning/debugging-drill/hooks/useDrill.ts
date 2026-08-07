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

export function useDrill() {
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
        setGeneratedQuestion(null);
        setEditorCode("");

        const response: GenerateResponse = await generateQuestion({
          id: currentDrill.id,
        });

        setGeneratedQuestion(response);
        setEditorCode(response.code);

        const nextCount = (topicQuestionCountsRef.current[topicId] ?? 0) + 1;
        topicQuestionCountsRef.current[topicId] = nextCount;
        setQuestionProgress({ topicId, count: nextCount });
      } catch (error) {
        console.error("Generation failed", error);
      } finally {
        if (activeGenerationRef.current === requestKey) {
          activeGenerationRef.current = null;
        }
        setLoading(false);
      }
    },
    [selectedDrill, setLoading, setGeneratedQuestion, setEditorCode]
  );

  const initializeDrills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadDrills();
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
    } finally {
      setLoading(false);
    }
  }, [setCollections, setSelectedDrill, setLoading, generate]);

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

  const submitSolution = useCallback(async () => {
    if (!selectedDrill) {
      return;
    }

    if (!editorCode.trim()) {
      return;
    }

    try {
      setEvaluating(true);
      const response: EvaluateResponse = await evaluateQuestion({
        id: selectedDrill.id,
        userCode: editorCode,
      });

      setEvaluation(response);
      openDrawer();
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setEvaluating(false);
    }
  }, [selectedDrill, editorCode, setEvaluating, setEvaluation, openDrawer]);

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
    evaluation,
    loading,
    evaluating,
    resultDrawerOpen,
    initializeDrills,
    selectDrill,
    generateQuestion: generate,
    nextQuestion,
    questionProgress,
    updateCode,
    submitSolution,
    closeResult,
    reset,
  };
}
