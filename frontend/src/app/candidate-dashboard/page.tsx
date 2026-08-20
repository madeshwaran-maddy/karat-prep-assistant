"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

export default function CandidateDashboard() {
  const [mockEnabled, setMockEnabled] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/me"), { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((candidate) => setMockEnabled(Boolean(candidate?.mockEnabled)))
      .catch(() => setMockEnabled(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Candidate Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Select a learning path to continue.</p>
          </div>
        </div>

        <div className="mb-6 flex justify-start">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
          >
            Go to Main Dashboard
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1.2fr] xl:grid-rows-[auto_auto]">
          <article className="rounded-[28px] border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm shadow-emerald-100/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Round 1 Learning</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Concepts, Practice Questions, Debugging Drills
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/candidate-dashboard/round-1-learning"
                className="inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Open
              </Link>
            </div>
          </article>

          <article className="rounded-[28px] border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm shadow-emerald-100/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Round 2 Learning</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Practice Questions, Code Editor & Assessment
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/candidate-dashboard/round-2-learning"
                className="inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Open
              </Link>
            </div>
          </article>

          <article className="xl:col-span-2 rounded-[28px] border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm shadow-emerald-100/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Mock Assessment</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Actual Assessment Style, Timed Questions
                </p>
              </div>
            </div>
            <div className="mt-6">
              {mockEnabled ? (
                <Link
                  href="/candidate-dashboard/mock-assesment"
                  className="inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Start Assessment
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed rounded-full bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-600">
                  Assessment Disabled
                </span>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
