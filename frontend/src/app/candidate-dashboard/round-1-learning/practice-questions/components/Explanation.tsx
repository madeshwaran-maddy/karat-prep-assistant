interface Props {
  explanation: string;
}

export default function Explanation({
  explanation,
}: Props) {
  return (
    <div className="mt-8">

      <h2 className="text-xl font-semibold">
        Explanation
      </h2>

      <div className="mt-3 rounded-lg border bg-gray-50 p-5 leading-7 whitespace-pre-wrap">
        {explanation}
      </div>

    </div>
  );
}