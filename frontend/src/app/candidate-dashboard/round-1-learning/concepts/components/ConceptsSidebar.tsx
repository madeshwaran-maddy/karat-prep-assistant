"use client";

import { Concept } from "../types";

interface Props {
  concepts: Concept[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function ConceptsSidebar({
  concepts,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="w-72 h-full min-h-0 overflow-y-auto border rounded-xl p-5">

      <h2 className="font-bold text-xl mb-5">
        Collections
      </h2>

      <div className="space-y-2 pb-4">

        {concepts.map((item) => (

          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition

            ${
              selected === item.id
                ? "bg-green-100 border border-green-500 text-green-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            {item.title}
          </button>

        ))}

      </div>

    </div>
  );
}