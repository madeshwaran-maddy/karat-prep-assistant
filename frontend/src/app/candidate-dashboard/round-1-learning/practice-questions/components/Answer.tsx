interface Props {
  answer: string;
}

export default function Answer({ answer }: Props) {
  return (
    <div className="mt-8">

      <h2 className="text-xl font-semibold text-green-700">
        Answer
      </h2>

      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-5">
        {answer}
      </div>

    </div>
  );
}