"use client";

import { EvaluateResponse } from "../types/drill";

interface ResultDrawerProps {
  open?: boolean;
  result?: EvaluateResponse | null;
  onClose?: () => void;
}

export default function ResultDrawer({
  open = false,
  result,
  onClose,
}: ResultDrawerProps) {
  return (
    <div className={`result-overlay ${open ? "open" : ""}`}>
      <div className={`result-drawer ${open ? "open" : ""}`}>

        <div className="result-header">

          <h2>Evaluation Result</h2>

          <button
            className="drawer-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {!result ? (
          <div className="empty-result">
            Submit your solution to view the evaluation.
          </div>
        ) : (
          <>
            <div className="result-summary">

              <div className="score-card">

                <div className="score-label">
                  Score
                </div>

                <div className="score-value">
                  {result.score}/10
                </div>

              </div>

              <div
                className={
                  result.correct
                    ? "status success"
                    : "status failure"
                }
              >
                {result.correct ? "✔ Correct" : "✖ Incorrect"}
              </div>

            </div>

            <div className="section">

              <h3>Explanation</h3>

              <p>{result.explanation}</p>

            </div>

            <div className="section">

              <h3>Suggestions</h3>

              <ul>

                {result.suggestions.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}

              </ul>

            </div>

            <div className="section">

              <h3>Corrected Code</h3>

              <pre className="corrected-code">
                <code>{result.correctedCode}</code>
              </pre>

            </div>
          </>
        )}

      </div>
    </div>
  );
}