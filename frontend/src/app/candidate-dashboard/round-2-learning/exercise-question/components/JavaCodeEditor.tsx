"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

import { ExerciseQuestion } from "../lib/questionTypes";
import ExecutionResult from "./ExecutionResult";

interface Props {
  question: ExerciseQuestion;
}

export default function JavaCodeEditor({
  question,
}: Props) {
  const [code, setCode] = useState(
    question.code
  );

  const [running, setRunning] = useState(false);

  const [output, setOutput] = useState("");

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  async function runCode() {
    try {
      setRunning(true);

      setOutput("");
      setError("");

      const response = await fetch(
        "/candidate-dashboard/round-2-learning/exercise-question/api/judge0",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            sourceCode: code,
            languageId: 5,
            stdin: "",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to execute code"
        );
      }

      if (result.compileOutput) {
        setError(result.compileOutput);
        return;
      }

      if (result.stderr) {
        setError(result.stderr);
        return;
      }

      setOutput(
        result.stdout ||
          "Program executed successfully."
      );

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Execution failed"
      );

    } finally {
      setRunning(false);
    }
  }

  return (
    <div>

      {/* Question title */}
      <div className="mb-5">

        <h3 className="text-xl font-semibold text-gray-900">
          {question.title}
        </h3>

      </div>

      {/* Code editor */}
      <div className="overflow-hidden rounded-xl bg-[#151b26]">

        {/* File name */}
        <div className="border-b border-gray-700 bg-[#202938] px-5 py-3">

          <span className="font-mono text-sm text-gray-200">
            Main.java
          </span>

        </div>

        <Editor
          height="450px"
          language="java"
          theme="vs-dark"
          value={code}
          onChange={(value) =>
            setCode(value || "")
          }
          options={{
            fontSize: 15,

            minimap: {
              enabled: false,
            },

            automaticLayout: true,

            scrollBeyondLastLine: false,

            tabSize: 4,

            wordWrap: "on",

            padding: {
              top: 15,
              bottom: 15,
            },

            scrollbar: {
              alwaysConsumeMouseWheel: false,
              vertical: "visible",
              horizontal: "visible",
            },
          }}
        />

      </div>

      {/* Run button */}
      <div className="mt-6 flex justify-end gap-3">

        <button
          type="button"
          onClick={runCode}
          disabled={running}
          className="rounded-lg bg-blue-600 px-10 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running
            ? "Running..."
            : "Run"}
        </button>

        <button
          type="button"
          onClick={async () => {
            try {
              setSubmitting(true);

              const response = await fetch("http://localhost:8000/api/assessments/submit-exercise-question", {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  assessmentId: question.assessmentId,
                  questionId: question.id,
                  userCode: code,
                  userAnalysis: output || error || "",
                }),
              });

              const data = await response.json().catch(() => ({}));

              if (!response.ok) {
                throw new Error(data.detail || "Failed to submit exercise question.");
              }

              alert(data.message || "Exercise answer submitted successfully.");
            } catch (submitError) {
              console.error("Exercise submit failed", submitError);
              alert(submitError instanceof Error ? submitError.message : "Failed to submit exercise question.");
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-10 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>

      </div>

      {/* Result */}
      <ExecutionResult
        running={running}
        output={output}
        error={error}
      />

    </div>
  );
}