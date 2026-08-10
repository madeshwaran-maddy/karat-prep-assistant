import styles from "../format-practice-question.module.css";
import CodeBlock from "./CodeBlock";
import type { PracticeQuestion } from "../types";

type Props = {
  question: PracticeQuestion;
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function QuestionContent({
  question,
  currentIndex,
  total,
  onPrevious,
  onNext,
}: Props) {
  const title = `Question ${question.questionNo || currentIndex + 1}`;

  return (
    <article className={styles.fpqCard}>
      <div className={styles.fpqQuestionHeading}>
        <h2>{title}</h2>
        <p>
          {question.title ||
            "Coding debugging question with Java code, answer and explanation."}
        </p>
      </div>

      <div className={styles.fpqDivider} />

      <section className={styles.fpqSection}>
        <h3>Question</h3>
        <CodeBlock code={question.question} />
      </section>

      <section className={styles.fpqSection}>
        <h3>Answer</h3>
        <CodeBlock code={question.answer} />
      </section>

      <section
        className={`${styles.fpqSection} ${styles.fpqExplanation}`}
      >
        <h3>Explanation</h3>

        <div className={styles.fpqExplanationText}>
          {question.explanation
            .split(/\n+/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      </section>

      <div className={styles.fpqActions}>
        <button
          type="button"
          className={`${styles.fpqNavButton} ${styles.secondary}`}
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          <span>‹</span> Previous
        </button>

        <button
          type="button"
          className={`${styles.fpqNavButton} ${styles.primary}`}
          onClick={onNext}
          disabled={currentIndex === total - 1}
        >
          Next <span>›</span>
        </button>
      </div>
    </article>
  );
}
