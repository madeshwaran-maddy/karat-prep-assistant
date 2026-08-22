"use client";

import Editor, { loader, OnMount } from "@monaco-editor/react";
import { useState } from "react";
import type { LanguageConfig } from "../../../../../config/languages";

loader.config({
  paths: {
    vs: "/monaco/vs",
  },
});

interface CompilerPopupProps {
  language: LanguageConfig;
  onClose: () => void;
}

interface CompilerResult {
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  message?: string;
  status?: { description?: string };
  time?: string | null;
}

const defaultCompilerCode = `// Keep the class name as Main for the program to run in this compiler.
class Main {
  public static void main(String args[]) {
    System.out.println("Hello! Inside Java Compiler");
  }
}`;

export default function CompilerPopup({ language, onClose }: CompilerPopupProps) {
  const [sourceCode, setSourceCode] = useState(defaultCompilerCode);
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<CompilerResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const handleMount: OnMount = (editor) => {
    editor.updateOptions({
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 4,
    });
    editor.focus();
  };

  const runCode = async () => {
    setIsRunning(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/candidate-dashboard/round-1-learning/practice-questions/api/judge0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode, stdin, language: language.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Compiler request failed.");
      setResult(data);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Compiler request failed.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Code compiler">
      <div className="flex h-[min(760px,90vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{language.name} compiler</h2>
            <p className="text-xs text-slate-500">Practice compiler</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runCode}
              disabled={isRunning || !sourceCode.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isRunning ? "Running..." : "Run code"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close compiler"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="h-[min(500px,52vh)] shrink-0 bg-slate-950 p-3">
          <Editor
            height="100%"
            defaultLanguage={language.monacoLanguage}
            value={sourceCode}
            onChange={(value) => setSourceCode(value ?? "")}
            onMount={handleMount}
            loading="Loading editor..."
            theme="vs-dark"
            options={{ automaticLayout: true, minimap: { enabled: false } }}
          />
        </div>

        <div className="grid gap-4 border-t border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Standard input
            <textarea
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 font-mono text-sm font-normal"
              placeholder="Optional input"
            />
          </label>
          <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-slate-100">
            {error ? <p className="text-red-300">{error}</p> : null}
            {!error && !result ? <p className="text-slate-400">Output will appear here.</p> : null}
            {result ? (
              <>
                <p className="mb-2 text-emerald-300">{result.status?.description || "Finished"}</p>
                <pre className="whitespace-pre-wrap">{result.stdout || result.compileOutput || result.stderr || result.message || "No output"}</pre>
                {result.time ? <p className="mt-2 text-slate-400">Time: {result.time}s</p> : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}