interface Props {
  running: boolean;
  output: string;
  error: string;
}

export default function ExecutionResult({
  running,
  output,
  error,
}: Props) {
  if (
    !running &&
    !output &&
    !error
  ) {
    return null;
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">

      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">

        <h3 className="font-semibold text-gray-800">
          Output
        </h3>

      </div>

      <div className="min-h-[100px] bg-[#111827] p-5 font-mono text-sm">

        {running && (
          <div className="text-gray-300">
            Running Java program...
          </div>
        )}

        {!running && output && (
          <pre className="whitespace-pre-wrap text-green-400">
            {output}
          </pre>
        )}

        {!running && error && (
          <pre className="whitespace-pre-wrap text-red-400">
            {error}
          </pre>
        )}

      </div>

    </div>
  );
}