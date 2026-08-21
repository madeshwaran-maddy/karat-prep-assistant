"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ReviewerShell } from "../components/ReviewerShell";
import { TablePagination, TABLE_PAGE_SIZE } from "../components/TablePagination";
import { Candidate, fetchCandidates } from "../lib/reviewer-data";
import styles from "../reviewer-dashboard.module.css";

export default function CandidateReportPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCandidates().then(setCandidates).catch(() => setCandidates([]));
  }, []);

  const results = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (value.length < 3) {
      return candidates;
    }

    return candidates
      .filter((candidate) =>
        Object.values(candidate).some((candidateValue) =>
          (typeof candidateValue === "string" || typeof candidateValue === "number") &&
          String(candidateValue).toLowerCase().includes(value)
        )
      );
  }, [candidates, search]);
  const totalPages = Math.max(1, Math.ceil(results.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedResults = results.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  return (
    <ReviewerShell active="report">
      <div className={styles.pageHeading}>
        <h1>Candidate Report</h1>
        <p>
          Search candidates, review attempt counts and open detailed reports.
        </p>
      </div>

      <section className={`${styles.panel} ${styles.searchPanel}`}>
        <div className={styles.searchRow}>
          <label>Search Candidate</label>

          <div className={styles.searchControl}>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Type at least 3 letters"
            />
          </div>
          <span className={styles.hint}>Searches all columns after 3 characters</span>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>Candidate Search Results</h2>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Language Selected</th>
                <th>Start Date</th>
                <th>Karat Prep Timeline</th>
                <th>Lead Name</th>
                <th>Total R1 Attempt</th>
                <th>Total R2 Attempt</th>
                <th>Total Mock Attempt</th>
                <th>Learning Progress</th>
                <th>Assessment Report</th>
              </tr>
            </thead>

            <tbody>
              {paginatedResults.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.languageSelected || "Not assigned"}</td>
                  <td>{candidate.startDate}</td>
                  <td>{candidate.timeline}</td>
                  <td>{candidate.leadName}</td>
                  <td>{candidate.round1Attempts}</td>
                  <td>{candidate.round2Attempts}</td>
                  <td>{candidate.totalMockAttempts ?? 0}</td>
                  <td>
                    <Link
                      className={styles.smallButton}
                      href={`./candidate-report/${candidate.id}/learning-progress`}
                    >
                      View
                    </Link>
                  </td>
                  <td>
                    <Link
                      className={styles.smallButton}
                      href={`./candidate-report/${candidate.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination page={currentPage} totalItems={results.length} onPageChange={setPage} />

        <div className={styles.infoNote}>
          Click &quot;View&quot; in any row to open the learning progress or assessment report screen.
        </div>
      </section>
    </ReviewerShell>
  );
}