"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  code: string;
}

export default function CodeViewer({ code }: Props) {
  return (
    <div className="mt-6 rounded-lg overflow-hidden">

      <SyntaxHighlighter
        language="java"
        style={oneDark}
        customStyle={{
          borderRadius: "10px",
          fontSize: "14px",
          padding: "20px",
        }}
      >
        {code}
      </SyntaxHighlighter>

    </div>
  );
}