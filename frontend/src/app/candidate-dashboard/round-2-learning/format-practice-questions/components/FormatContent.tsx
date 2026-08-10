import styles from "../format-practice-question.module.css";
import type { FormatConfig } from "../types";

type Props = {
  format: FormatConfig;
};

export default function FormatContent({ format }: Props) {
  return (
    <article className={styles.fpqCard}>
      <div className={styles.fpqQuestionHeading}>
        <h2>{format.title || "Format Guidance"}</h2>
        {format.description ? <p>{format.description}</p> : null}
      </div>

      <div className={styles.fpqDivider} />

      {format.details?.length ? (
        <section className={styles.fpqSection}>
          <h3>Format Details</h3>
          <div className={styles.fpqFormatBody}>
            {format.details.map((detail, index) => (
              <div className={styles.fpqFormatDetail} key={`${detail.label}-${index}`}>
                <span className={styles.fpqDetailLabel}>{detail.label}</span>
                <span className={styles.fpqDetailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {format.sections?.map((section, sectionIndex) => (
        <section className={styles.fpqSection} key={`${section.title}-${sectionIndex}`}>
          <h3>{section.title}</h3>
          <div className={styles.fpqFormatBody}>
            {section.items.map((item, itemIndex) => (
              <div className={styles.fpqFormatDetail} key={`${item.label}-${itemIndex}`}>
                <span className={styles.fpqDetailLabel}>{item.label}</span>
                <span className={styles.fpqDetailValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
