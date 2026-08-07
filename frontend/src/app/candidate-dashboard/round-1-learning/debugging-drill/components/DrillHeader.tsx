"use client";

interface DrillHeaderProps {
  topic?: string;
  difficulty?: string;
}

export default function DrillHeader({
  topic,
  difficulty,
}: DrillHeaderProps) {

  return (

    <header className="drill-header">

      <div>

        <h1 className="header-title">

          Debugging Drill

        </h1>

        <p className="header-subtitle">

          Fix one bug in the generated Java code.

        </p>

      </div>

      <div className="header-right">

        {topic && (

          <span className="header-topic">

            {topic}

          </span>

        )}

        {difficulty && (

          <span className="header-difficulty">

            {difficulty}

          </span>

        )}

      </div>

    </header>

  );
}