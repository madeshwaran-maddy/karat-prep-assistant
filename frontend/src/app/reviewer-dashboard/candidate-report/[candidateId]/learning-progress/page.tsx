"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronUp, CircleHelp, ClipboardList } from "lucide-react";
import { ReviewerShell } from "../../../components/ReviewerShell";
import { Candidate, fetchCandidate, fetchLearningProgress, LearningProgress, ProgressMetric, ProgressTopic } from "../../../lib/reviewer-data";
import styles from "../../../reviewer-dashboard.module.css";

export default function CandidateLearningProgressPage() {
  const params = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<keyof LearningProgress["details"]>("round1Concepts");
  const [expanded, setExpanded] = useState<string | null>("overall");

  useEffect(() => {
    Promise.all([fetchCandidate(params.candidateId), fetchLearningProgress(params.candidateId)])
      .then(([candidateData, progressData]) => {
        setCandidate(candidateData);
        setProgress(progressData);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to load progress."));
  }, [params.candidateId]);

  if (error) return <div className={styles.notFound}>{error}</div>;
  if (!candidate) {
    return <div className={styles.notFound}>Candidate not found.</div>;
  }

  const totalAttempts = candidate.totalMockAttempts ?? 0;
  if (!progress) return <div className={styles.notFound}>Loading learning progress...</div>;

  const metrics = [
    { ...progress.summary.round1Concepts, key: "round1Concepts" as const, label: "Concepts", tone: "blue" as const, icon: <BookOpen size={21} />, round: "1" },
    { ...progress.summary.round1Practice, key: "round1Practice" as const, label: "Practice Questions", tone: "green" as const, icon: <CircleHelp size={21} />, round: "1" },
    { ...progress.summary.round2Practice, key: "round2Practice" as const, label: "Practice Questions", tone: "violet" as const, icon: <ClipboardList size={21} />, round: "2" },
  ];
  const detailTopics = progress.details[selectedProgress];
  const selectedMetric = progress.summary[selectedProgress];
  const detailTitle = selectedProgress === "round1Concepts"
    ? "Round 1 Concept Progress"
    : selectedProgress === "round1Practice"
      ? "Round 1 Practice Question Progress"
      : "Round 2 Format + Practice Progress";

  return (
    <ReviewerShell active="report">
      <div className={styles.learningHeader}>
        <div>
          <div className={styles.eyebrow}>Candidate learning report</div>
          <h1>Learning Dashboard</h1>
        </div>
      </div>

      <section className={styles.progressCards} aria-label="Learning progress summary">
        {metrics.map((metric) => (
          <ProgressCard key={metric.key} metric={metric} onView={() => setSelectedProgress(metric.key)} />
        ))}
      </section>

      <section className={styles.progressDetails}>
        <div className={styles.detailsHeader}>
          <div>
            <div className={styles.eyebrow}>{selectedProgress === "round2Practice" ? "Round 2" : "Round 1"}</div>
            <h2>Details: {detailTitle}</h2>
          </div>
          <Link className={styles.backButton} href="../"><ArrowLeft size={15} /> Back to Report</Link>
        </div>

        <div className={styles.detailColumns}>
          <TopicColumn
            title="Overall Progress"
            count={`${selectedMetric.completed} / ${selectedMetric.total}`}
            topics={detailTopics}
            tone="completed"
            expanded={expanded === "overall"}
            onToggle={() => setExpanded(expanded === "overall" ? null : "overall")}
          />
        </div>
      </section>

      <div className={styles.learningFooter}>
        <span>{totalAttempts} mock assessment{totalAttempts === 1 ? "" : "s"} completed</span>
        <Link href="../">Return to candidate report <ArrowRight size={15} /></Link>
      </div>
    </ReviewerShell>
  );
}

function ProgressCard({ metric, onView }: { metric: ProgressMetric & { key: keyof LearningProgress["details"]; label: string; tone: "blue" | "green" | "violet"; icon: React.ReactNode; round: string }; onView: () => void }) {
  const percentage = metric.percentage;

  return (
    <article className={`${styles.progressCard} ${styles[metric.tone]}`}>
      <div className={styles.cardTitle}><span className={styles.cardIcon}>{metric.icon}</span><span>{metric.label}</span></div>
      <div className={styles.cardRound}>ROUND {metric.round}</div>
      <div className={styles.cardBody}>
        <div className={styles.progressRing} style={{ "--progress": `${percentage}%` } as React.CSSProperties}>
          <strong>{percentage}%</strong><span>Completed</span>
        </div>
        <div className={styles.metricCount}><strong>{metric.completed} / {metric.total}</strong></div>
      </div>
      <button className={styles.detailsButton} type="button" onClick={onView}>View Details <ArrowRight size={14} /></button>
    </article>
  );
}

function TopicColumn({ title, count, topics, tone, expanded, onToggle }: { title: string; count: string; topics: ProgressTopic[]; tone: "completed" | "pending"; expanded: boolean; onToggle: () => void }) {
  return (
    <div className={`${styles.topicColumn} ${styles[tone]}`}>
      <button className={styles.topicColumnHeader} type="button" onClick={onToggle} aria-expanded={expanded}>
        <span className={styles.statusDot}><Check size={11} /></span>
        <span><strong>{title}</strong><small>{count}</small></span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && <div className={styles.topicList}>
        {topics.map((topic) => (
          <details className={styles.topicGroup} key={topic.name} open>
            <summary><span><b>{topic.name}</b> <em>({topic.total ? Math.round(topic.completed * 100 / topic.total) : 0}%)</em></span><ChevronDown size={14} /></summary>
            <ul>{topic.items.map((item) => <li key={item.name}><span className={item.completed ? styles.itemComplete : styles.itemPending}>{item.completed ? <Check size={10} /> : ""}</span>{item.name}</li>)}</ul>
          </details>
        ))}
      </div>}
    </div>
  );
}
