"use client";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export default function CodeEditor({
  value,
  onChange,
  language,
}: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
      rows={25}
      className="w-full resize-none overflow-auto rounded-b-lg bg-slate-950 p-5 font-mono text-sm leading-6 text-white outline-none scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900"
      aria-label={`${language} code editor`}
      style={{
        resize: "none",
        height: "650px",
        minHeight: "650px",
        overflowY: "auto",
      }}
    />
  );
}
