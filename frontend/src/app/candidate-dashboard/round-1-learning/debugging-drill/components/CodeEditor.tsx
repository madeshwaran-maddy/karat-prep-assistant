"use client";

import { useEffect, useRef } from "react";
import Editor, { Editor as MonacoEditor, OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  code?: string;
  language?: string;
  readOnly?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
}

export default function CodeEditor({
  code = "",
  language = "java",
  readOnly = false,
  loading = false,
  onChange,
}: CodeEditorProps) {
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<unknown>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.focus();

    editor.updateOptions({
      fontSize: 15,
      minimap: {
        enabled: false,
      },
      roundedSelection: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: "on",
      formatOnPaste: true,
      formatOnType: true,
      scrollSensitivity: 2,
      scrollbar: {
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });
  };

  useEffect(() => {
    if (!editorRef.current) return;

    editorRef.current.layout();
  }, []);

  const handleChange = (value?: string) => {
    onChange?.(value ?? "");
  };

  return (
    <div className="code-editor-wrapper" style={{ height: 650 }}>

      <div className="editor-toolbar">

        <span className="editor-title">
          Java Editor
        </span>

        {loading && (
          <span className="editor-loading">
            Generating...
          </span>
        )}

      </div>

      <div className="code-editor-surface" style={{ height: 590 }}>

        <Editor
          height="100%"
          defaultLanguage={language}
          value={code}
          onMount={handleMount}
          onChange={handleChange}
          loading="Loading editor..."
          theme="vs-dark"
          options={{
            readOnly,
            automaticLayout: true,
            minimap: {
              enabled: false,
            },
            glyphMargin: false,
            folding: true,
            lineNumbers: "on",
            bracketPairColorization: {
              enabled: true,
            },
            scrollBeyondLastLine: false,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />

      </div>

    </div>
  );
}