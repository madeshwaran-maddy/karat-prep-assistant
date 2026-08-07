"use client";

import { create } from "zustand";
import {
  Drill,
  EvaluateResponse,
  GenerateResponse,
} from "../types/drill";

interface DrillState {
  // JSON data
  collections: Record<string, Drill[]>;

  // Current selection
  selectedDrill: Drill | null;

  // Generated question
  generatedQuestion: GenerateResponse | null;

  // Editor
  editorCode: string;

  // Evaluation
  evaluation: EvaluateResponse | null;

  // UI State
  loading: boolean;
  evaluating: boolean;
  resultDrawerOpen: boolean;

  // Actions
  setCollections: (collections: Record<string, Drill[]>) => void;

  setSelectedDrill: (drill: Drill | null) => void;

  setGeneratedQuestion: (question: GenerateResponse | null) => void;

  setEditorCode: (code: string) => void;

  setEvaluation: (evaluation: EvaluateResponse | null) => void;

  setLoading: (loading: boolean) => void;

  setEvaluating: (loading: boolean) => void;

  openDrawer: () => void;

  closeDrawer: () => void;

  reset: () => void;
}

export const useDrillStore = create<DrillState>((set) => ({
  collections: {},

  selectedDrill: null,

  generatedQuestion: null,

  editorCode: "",

  evaluation: null,

  loading: false,

  evaluating: false,

  resultDrawerOpen: false,

  setCollections: (collections) =>
    set({
      collections,
    }),

  setSelectedDrill: (selectedDrill) =>
    set({
      selectedDrill,
    }),

  setGeneratedQuestion: (generatedQuestion) =>
    set({
      generatedQuestion,
    }),

  setEditorCode: (editorCode) =>
    set({
      editorCode,
    }),

  setEvaluation: (evaluation) =>
    set({
      evaluation,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  setEvaluating: (evaluating) =>
    set({
      evaluating,
    }),

  openDrawer: () =>
    set({
      resultDrawerOpen: true,
    }),

  closeDrawer: () =>
    set({
      resultDrawerOpen: false,
    }),

  reset: () =>
    set({
      selectedDrill: null,

      generatedQuestion: null,

      editorCode: "",

      evaluation: null,

      loading: false,

      evaluating: false,

      resultDrawerOpen: false,
    }),
}));