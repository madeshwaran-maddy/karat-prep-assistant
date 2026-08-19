import styles from "../format-practice-question.module.css";
import type { PracticeQuestion } from "../types";
import type { ProgressStatus } from "../hooks/useRound2Progress";

type TabKey = "format" | number;

type Props = {
  questions: PracticeQuestion[];
  selectedTab: TabKey;
  onSelect: (tab: TabKey) => void;
  getStatus: (topicId: string, questionNo: number) => ProgressStatus;
};

export default function FormatSidebar({
  questions,
  selectedTab,
  onSelect,
  getStatus,
}: Props) {
  const formatStatus = getStatus("format", 0);

  function statusClass(status: ProgressStatus) {
    if (status === "completed") {
      return styles.completed;
    }

    if (status === "in_progress") {
      return styles.inProgress;
    }

    return "";
  }

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
          <span className={`${styles.fpqStatus} ${statusClass(formatStatus)}`}>
            {formatStatus.replace("_", " ")}
          </span>
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
            <span
              className={`${styles.fpqStatus} ${statusClass(
                getStatus(
                  "format-practice-questions",
                  question.questionNo || index + 1
                )
              )}`}
            >
              {getStatus("format-practice-questions", question.questionNo || index + 1).replace("_", " ")}
            </span>
          </button>
        ))}
      </nav>

      {!questions.length && (
        <div className={styles.fpqEmptySidebar}>No questions available.</div>
      )}
    </aside>
  );
}
