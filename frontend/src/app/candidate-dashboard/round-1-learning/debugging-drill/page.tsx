"use client";

import Link from "next/link";
import DrillHeader from "./components/DrillHeader";
import DrillSidebar from "./components/DrillSidebar";
import CodeEditor from "./components/CodeEditor";
import SubmitButton from "./components/SubmitButton";
import ResultDrawer from "./components/ResultDrawer";
import LoadingOverlay from "./components/LoadingOverlay";
import { useDrill } from "./hooks/useDrill";

import "./styles/debugging.css";

export default function DebuggingDrillPage() {
  const {
    selectedDrill,
    generatedQuestion,
    editorCode,
    evaluation,
    loading,
    evaluating,
    resultDrawerOpen,
    selectDrill,
    nextQuestion,
    questionProgress,
    updateCode,
    updateAnalysis,
    analysisText,
    submitSolution,
    closeResult,
  } = useDrill();

  return (

    <div className="debug-page">

      <div className="px-6 pt-6">
        <Link
          href="/candidate-dashboard/round-1-learning"
          className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back to Round 1 Learning
        </Link>
      </div>

      <DrillHeader
        topic={generatedQuestion?.topic}
        difficulty={generatedQuestion?.difficulty}
      />

      <div className="debug-layout">

        <aside className="sidebar">

          <DrillSidebar
            selectedId={selectedDrill?.id}
            onSelect={selectDrill}
          />

        </aside>

        <main className="editor-container">

          <CodeEditor
            code={editorCode}
            loading={loading}
            onChange={updateCode}
          />

          <div className="analysis-box mt-4">
            <div className="analysis-label">Output and Bug Analysis</div>
            <textarea
              className="analysis-textarea"
              placeholder="Describe the output and your bug analysis here..."
              value={analysisText || ""}
              onChange={(e) => updateAnalysis(e.target.value)}
            />
          </div>

          <div className="mt-4 flex flex-col items-end gap-3">
            <SubmitButton
              disabled={!generatedQuestion}
              loading={evaluating}
              onSubmit={submitSolution}
            />

            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!generatedQuestion || questionProgress.count >= 3}
              onClick={nextQuestion}
            >
              {questionProgress.count >= 3 ? "Completed" : `Next Question${questionProgress.count > 0 ? ` (${questionProgress.count + 1}/3)` : ""}`}
            </button>
          </div>

        </main>

      </div>

      <ResultDrawer
        open={resultDrawerOpen}
        result={evaluation}
        onClose={closeResult}
      />

      <LoadingOverlay visible={loading} message="Generating question..." />

    </div>

  );
}