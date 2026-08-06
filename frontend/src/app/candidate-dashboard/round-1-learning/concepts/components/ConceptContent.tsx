import { Concept } from "../types";
import BulletSection from "./BulletSection";
import CodeBlock from "./CodeBlock";

interface Props {
  concept: Concept;
}

export default function ConceptContent({
  concept,
}: Props) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/40 space-y-10">
      <div>
        <h1 className="text-4xl font-bold mb-6">{concept.title}</h1>
      </div>

      <div className="space-y-10">
        <BulletSection title="Explanation" items={concept.explanation} />

        <BulletSection title="Key Concepts" items={concept.keyConcepts} />

        <BulletSection title="Common Mistakes" items={concept.commonMistakes} />

        <div>
          <h3 className="text-2xl font-semibold mb-4">Coding Example</h3>
          <CodeBlock code={concept.codeExample} />
        </div>

        <BulletSection title="Debugging Scenario" items={concept.debuggingScenario} />
      </div>
    </div>
  );
}