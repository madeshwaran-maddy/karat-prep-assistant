"use client";

import Link from "next/link";
import { ReviewerShell } from "./components/ReviewerShell";
import styles from "./reviewer-dashboard.module.css";

export default function ReviewerDashboardPage() {
  return (
    <ReviewerShell active="dashboard">
      <div className="mb-4 flex justify-start">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
        >
          Go to Main Dashboard
        </Link>
      </div>

      <div className={styles.pageHeading}>
        <h1>Reviewer Workspace</h1>
        <p>Manage candidate reports and candidate information.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <Link href="/reviewer-dashboard/candidate-report" className={styles.featureCard}>
          <div className={styles.featureIcon}>▣</div>
          <div className={styles.featureBody}>
            <h2>Candidate Report</h2>
            <p>Search candidates and view scores.</p>
            <p>Review Round 1 and Round 2 attempt history.</p>
            <p>Open detailed performance reports and submitted solutions.</p>
          </div>
          <span className={styles.primaryButton}>Open</span>
        </Link>

        <Link href="/reviewer-dashboard/candidate-information" className={styles.featureCard}>
          <div className={styles.featureIcon}>♙</div>
          <div className={styles.featureBody}>
            <h2>Candidate Information</h2>
            <p>Search and update candidate profiles.</p>
            <p>Maintain email, phone, lead, timeline and status details.</p>
            <p>Manage candidate information.</p>
          </div>
          <span className={styles.primaryButton}>Open</span>
        </Link>
      </div>
    </ReviewerShell>
  );
}