"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReviewerShell } from "../../components/ReviewerShell";
import { TablePagination, TABLE_PAGE_SIZE } from "../../components/TablePagination";
import { Candidate, fetchCandidate } from "../../lib/reviewer-data";
import styles from "../../reviewer-dashboard.module.css";

const roundOrder = {
  "Round 1": 1,
  "Round 2": 2,
  "Round 3": 3,
} as const;

export default function CandidateDetailedReportPage() {
  const params = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCandidate(params.candidateId).then(setCandidate).catch(() => setCandidate(null));
  }, [params.candidateId]);

  if (!candidate) {
    return <div className={styles.notFound}>Candidate not found.</div>;
  }

  const orderedAttempts = [...candidate.attempts].sort(
    (firstAttempt, secondAttempt) => roundOrder[firstAttempt.round] - roundOrder[secondAttempt.round]
  );
  const totalPages = Math.max(1, Math.ceil(orderedAttempts.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedAttempts = orderedAttempts.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

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
                <th>Round 1 / Round 2 / Mock</th>
                <th>Attempt No</th>
                <th>Attempted Date</th>
                <th>View Progress</th>
              </tr>
            </thead>

            <tbody>
              {paginatedAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>{attempt.round === "Round 3" ? "Mock" : attempt.round}</td>
                  <td>{attempt.attemptNo}</td>
                  <td>{attempt.attemptedDate}</td>
                  <td>
                    <Link
                      className={styles.smallButton}
                      href={`/reviewer-dashboard/candidate-report/${candidate.id}/attempt/${attempt.id}`}
                    >
                      View Progress
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination page={currentPage} totalItems={orderedAttempts.length} onPageChange={setPage} />

        <div className={styles.bottomRow}>
          <Link className={styles.primaryButton} href="../">
            Back
          </Link>
          <span>
            Click &quot;View Progress&quot; to open the submitted solution viewer.
          </span>
        </div>
      </section>
    </ReviewerShell>
  );
}