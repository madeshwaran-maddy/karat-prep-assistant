"use client";

import { useMemo, useState } from "react";
import { ReviewerShell } from "../components/ReviewerShell";
import { candidates } from "../lib/reviewer-data";
import styles from "../reviewer-dashboard.module.css";

export default function CandidateInformationPage() {
  const [search, setSearch] = useState("");
  const [loadedId, setLoadedId] = useState(candidates[0]?.id ?? "");
  const [message, setMessage] = useState("");

  const candidate = candidates.find((item) => item.id === loadedId);

  const suggestions = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (value.length < 3) {
      return [];
    }

    return candidates.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value)
    );
  }, [search]);

  return (
    <ReviewerShell active="candidate">
      <div className={styles.pageHeading}>
        <h1>Candidate Information</h1>
        <p>Search and update existing candidate information.</p>
      </div>

      <section className={`${styles.panel} ${styles.formPanel}`}>
        <h2 className={styles.sectionTitle}>Edit Candidate</h2>

        <div className={styles.editSearch}>
          <label>Search Candidate</label>

          <div className={styles.searchControl}>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setMessage("");
              }}
              placeholder="Search by candidate name or email"
            />

            {suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setLoadedId(item.id);
                      setSearch("");
                      setMessage(`Loaded: ${item.name}`);
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={styles.primaryButton}
            onClick={() => {
              const match =
                suggestions[0] ??
                candidates.find(
                  (item) =>
                    item.name.toLowerCase() === search.trim().toLowerCase() ||
                    item.email.toLowerCase() === search.trim().toLowerCase()
                );

              if (match) {
                setLoadedId(match.id);
                setSearch("");
                setMessage(`Loaded: ${match.name}`);
              } else {
                setMessage("Candidate not found.");
              }
            }}
          >
            Search
          </button>

          <span className={styles.loadedBadge}>
            {message || `Loaded: ${candidate?.name ?? ""}`}
          </span>
        </div>

        {candidate && (
          <div key={candidate.id} className={styles.formGrid}>
            <label>
              Candidate Name
              <input defaultValue={candidate.name} />
            </label>

            <label>
              Email
              <input defaultValue={candidate.email} type="email" />
            </label>

            <label>
              Phone Number
              <input defaultValue={candidate.phone} />
            </label>

            <label>
              Lead Name
              <input defaultValue={candidate.leadName} />
            </label>

            <label>
              Start Date
              <input defaultValue={candidate.startDate} />
            </label>

            <label>
              Karat Prep Timeline
              <select defaultValue={candidate.timeline}>
                <option>8 Weeks</option>
                <option>10 Weeks</option>
                <option>12 Weeks</option>
                <option>16 Weeks</option>
              </select>
            </label>

            <label>
              Status
              <select defaultValue={candidate.status}>
                <option>Active</option>
                <option>Completed</option>
                <option>Inactive</option>
              </select>
            </label>

            <div className={styles.formActions}>
              <button
                className={styles.primaryButton}
                onClick={() =>
                  setMessage("Candidate information updated successfully.")
                }
              >
                Update Candidate
              </button>
            </div>
          </div>
        )}
      </section>
    </ReviewerShell>
  );
}