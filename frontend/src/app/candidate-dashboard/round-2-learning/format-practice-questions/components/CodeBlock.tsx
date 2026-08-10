import styles from "../format-practice-question.module.css";

type Props = {
  code: string;
};

export default function CodeBlock({ code }: Props) {
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard can be unavailable when browser permissions are restricted.
    }
  }

  const lines = code.split(/\r?\n/);

  return (
    <div className={styles.fpqCodeWrapper}>
      <button
        type="button"
        className={styles.fpqCopy}
        onClick={copyCode}
        aria-label="Copy code"
        title="Copy code"
      >
        ⧉
      </button>

      <pre className={styles.fpqCode}>
        <code>
          {lines.map((line, index) => (
            <span className={styles.fpqCodeLine} key={index}>
              <span className={styles.fpqLineNumber}>{index + 1}</span>
              <span className={styles.fpqLineContent}>{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
