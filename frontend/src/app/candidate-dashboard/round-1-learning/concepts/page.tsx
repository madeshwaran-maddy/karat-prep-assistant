"use client";

import Link from "next/link";
import { useState } from "react";

import data from "./data/concepts.json";

import ConceptContent from "./components/ConceptContent";
import ConceptsSidebar from "./components/ConceptsSidebar";

export default function ConceptsPage() {

  const concepts = data.collections;

  const [selected, setSelected] = useState(
    concepts[0].id
  );

  const currentConcept =
    concepts.find((c) => c.id === selected)!;

  return (

    <div className="pt-6 pb-10 px-6 min-h-[calc(100vh-3rem)] overflow-hidden">
      <div className="mb-3">
        <Link
          href="/candidate-dashboard/round-1-learning"
          className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back to Round 1 Learning
        </Link>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-8 min-h-0">

        <div className="min-h-0 overflow-hidden">
          <ConceptsSidebar
            concepts={concepts}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <div className="min-h-0 overflow-hidden">
          <div className="h-full min-h-0 overflow-y-auto pb-2">
            <ConceptContent concept={currentConcept} />
          </div>
        </div>

      </div>

    </div>

  );
}