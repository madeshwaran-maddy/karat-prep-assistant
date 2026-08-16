"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ReviewerShell } from "../components/ReviewerShell";
import { Candidate, fetchCandidates } from "../lib/reviewer-data";
import styles from "../reviewer-dashboard.module.css";

export default function CandidateReportPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    fetchCandidates().then(setCandidates).catch(() => setCandidates([]));
  }, []);

  const suggestions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (value.length < 3) {
      return [];
    }

    return candidates
      .filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(value) ||
          candidate.email.toLowerCase().includes(value)
      )
      .slice(0, 6);
  }, [candidates, search]);

  const results = selectedId
    ? candidates.filter((candidate) => candidate.id === selectedId)
    : candidates;

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
                setSelectedId("");
              }}
              placeholder="Type at least 3 letters"
            />

            {suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => {
                      setSelectedId(candidate.id);
                      setSearch(candidate.name);
                    }}
                  >
                    {candidate.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={styles.primaryButton}
            onClick={() => {
              if (suggestions[0]) {
                setSelectedId(suggestions[0].id);
                setSearch(suggestions[0].name);
              }
            }}
          >
            Search
          </button>

          <span className={styles.hint}>Dropdown after 3 letters</span>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>Candidate Search Results</h2>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Start Date</th>
                <th>Karat Prep Timeline</th>
                <th>Lead Name</th>
                <th>Total R1 Attempt</th>
                <th>Total R2 Attempt</th>
                <th>Total Mock Attempt</th>
                <th>View Learning Progress</th>
                <th>View Assessment Report</th>
              </tr>
            </thead>

            <tbody>
              {results.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
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

        <div className={styles.infoNote}>
          Click &quot;View&quot; in any row to open the learning progress or assessment report screen.
        </div>
      </section>
    </ReviewerShell>
  );
}