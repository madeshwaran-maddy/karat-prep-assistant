import styles from "../format-practice-question.module.css";
import type { PracticeQuestion } from "../types";

type TabKey = "format" | number;

type Props = {
  questions: PracticeQuestion[];
  selectedTab: TabKey;
  onSelect: (tab: TabKey) => void;
};

export default function FormatSidebar({
  questions,
  selectedTab,
  onSelect,
}: Props) {
  return (
    <aside className={styles.fpqSidebar}>
      <h2>Format &amp; Questions</h2>

      <nav
        className={styles.fpqQuestionList}
        aria-label="Format and practice questions"
      >
        <button
          type="button"
          className={`${styles.fpqQuestionTab} ${
            selectedTab === "format" ? styles.active : ""
          }`}
          onClick={() => onSelect("format")}
        >
          {selectedTab === "format" && (
            <span className={styles.fpqPlay}>▶</span>
          )}
          <span>Format</span>
        </button>
        {questions.map((question, index) => (
          <button
            key={`${question.id}-${index}`}
            type="button"
            className={`${styles.fpqQuestionTab} ${
              selectedTab === index ? styles.active : ""
            }`}
            onClick={() => onSelect(index)}
          >
            {selectedTab === index && (
              <span className={styles.fpqPlay}>▶</span>
            )}
            <span>Question {question.questionNo || index + 1}</span>
          </button>
        ))}
      </nav>

      {!questions.length && (
        <div className={styles.fpqEmptySidebar}>No questions available.</div>
      )}
    </aside>
  );
}
