"use client";

import { useEffect, useMemo, useState } from "react";
import { ReviewerShell } from "../components/ReviewerShell";
import { Candidate, fetchCandidates } from "../lib/reviewer-data";
import styles from "../reviewer-dashboard.module.css";

function toDateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

export default function CandidateInformationPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [loadedId, setLoadedId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCandidates().then((items) => {
      setCandidates(items);
      if (items[0]) {
        setLoadedId(items[0].id);
      }
    }).catch(() => setCandidates([]));
  }, []);

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
          <form
            key={candidate.id}
            className={styles.formGrid}
            onSubmit={async (event) => {
              event.preventDefault();

              const form = event.currentTarget;
              const formData = new FormData(form);
              const payload = {
                name: String(formData.get("name") ?? ""),
                email: String(formData.get("email") ?? ""),
                phone: String(formData.get("phone") ?? ""),
                language_selected: String(formData.get("language_selected") ?? ""),
                lead_name: String(formData.get("lead_name") ?? ""),
                start_date: String(formData.get("start_date") ?? ""),
                karat_assessment_date: String(formData.get("karat_assessment_date") ?? ""),
                karat_prep_timeline: String(formData.get("karat_prep_timeline") ?? ""),
                status: String(formData.get("status") ?? "pending"),
                role: String(formData.get("role") ?? "candidate"),
              };

              try {
                const response = await fetch(
                  `http://localhost:8000/api/reviewer/candidates/${candidate.id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to update candidate information.");
                }

                const updatedCandidate = await response.json();
                setCandidates((items) =>
                  items.map((item) =>
                    item.id === candidate.id
                      ? {
                          ...item,
                          name: updatedCandidate.name,
                          email: updatedCandidate.email,
                          phone: updatedCandidate.phone ?? "",
                          languageSelected: updatedCandidate.languageSelected ?? "",
                          startDate: updatedCandidate.startDate,
                          karatAssessmentDate: updatedCandidate.karatAssessmentDate,
                          timeline: updatedCandidate.timeline,
                          leadName: updatedCandidate.leadName,
                          status: updatedCandidate.status,
                          role: updatedCandidate.role,
                        }
                      : item
                  )
                );
                setMessage("Candidate information updated successfully.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Failed to update candidate information.");
              }
            }}
          >
            <label>
              Candidate Name
              <input name="name" defaultValue={candidate.name} />
            </label>

            <label>
              Email
              <input name="email" defaultValue={candidate.email} type="email" />
            </label>

            <label>
              Phone Number
              <input name="phone" defaultValue={candidate.phone} />
            </label>

            <label>
              Programming Language
              <select name="language_selected" defaultValue={candidate.languageSelected || ""}>
                <option value="">Select a language</option>
                <option value="Java">Java</option>
                <option value="Node.js">Node.js</option>
              </select>
            </label>

            <label>
              Lead Name
              <input name="lead_name" defaultValue={candidate.leadName} />
            </label>

            <label>
              Start Date
              <input
                name="start_date"
                type="date"
                defaultValue={toDateInputValue(candidate.startDate)}
              />
            </label>

            <label>
              Karat Assessment Date
              <input
                name="karat_assessment_date"
                type="date"
                defaultValue={toDateInputValue(
                  (candidate as typeof candidate & { karatAssessmentDate?: string })
                    .karatAssessmentDate
                )}
              />
            </label>

            <label>
              Karat Prep Timeline
              <select name="karat_prep_timeline" defaultValue={candidate.timeline || "2 week"}>
                <option value="2 week">2 week</option>
                <option value="4 week">4 week</option>
                <option value="6 week">6 week</option>
                <option value="8 week">8 week</option>
              </select>
            </label>

            <label>
              Role
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="role"
                    value="candidate"
                    style={{ transform: "scale(0.85)" }}
                    defaultChecked={!(candidate as typeof candidate & { role?: string }).role || (candidate as typeof candidate & { role?: string }).role === "candidate"}
                  />
                  Candidate
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="role"
                    value="reviewer"
                    style={{ transform: "scale(0.85)" }}
                    defaultChecked={(candidate as typeof candidate & { role?: string }).role === "reviewer"}
                  />
                  Reviewer
                </label>
              </div>
            </label>

            <label>
              Status
              <select name="status" defaultValue={candidate.status || "pending"}>
                <option value="pending">Pending</option>
                <option value="in_progress">In_progress</option>
                <option value="completed">Completed</option>
                <option value="waiting for result">Waiting for result</option>
                <option value="cleared">Cleared</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>

            <div className={styles.formActions}>
              <button className={styles.primaryButton} type="submit">
                Update Candidate
              </button>
            </div>
          </form>
        )}
      </section>
    </ReviewerShell>
  );
}