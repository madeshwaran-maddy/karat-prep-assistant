"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ReviewerShell } from "../../components/ReviewerShell";
import { getCandidate } from "../../lib/reviewer-data";
import styles from "../../reviewer-dashboard.module.css";

export default function CandidateDetailedReportPage() {
  const params = useParams<{ candidateId: string }>();
  const candidate = getCandidate(params.candidateId);

  if (!candidate) {
    return <div className={styles.notFound}>Candidate not found.</div>;
  }

  return (
    <ReviewerShell active="report">
      <div className={styles.pageHeading}>
        <h1>Candidate Detailed Report</h1>
        <p>
          Review candidate details and all Round 1 / Round 2 attempt history.
        </p>
      </div>

      <section className={styles.candidateSummary}>
        <div>
          <span>Candidate Name</span>
          <strong>{candidate.name}</strong>
        </div>
        <div>
          <span>Start Date</span>
          <strong>{candidate.startDate}</strong>
        </div>
        <div>
          <span>Karat Prep Timeline</span>
          <strong>{candidate.timeline}</strong>
        </div>
        <div>
          <span>Lead Name</span>
          <strong>{candidate.leadName}</strong>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>Attempt History</h2>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Round 1 / Round 2</th>
                <th>Attempt No</th>
                <th>Attempted Date</th>
                <th>View Solution</th>
              </tr>
            </thead>

            <tbody>
              {candidate.attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>{attempt.round}</td>
                  <td>{attempt.attemptNo}</td>
                  <td>{attempt.attemptedDate}</td>
                  <td>
                    <Link
                      className={styles.smallButton}
                      href={`/reviewer-dashboard/candidate-report/${candidate.id}/attempt/${attempt.id}`}
                    >
                      View Solution
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.bottomRow}>
          <Link className={styles.primaryButton} href="../">
            Back
          </Link>
          <span>
            Click &quot;View Solution&quot; to open the submitted solution viewer.
          </span>
        </div>
      </section>
    </ReviewerShell>
  );
}