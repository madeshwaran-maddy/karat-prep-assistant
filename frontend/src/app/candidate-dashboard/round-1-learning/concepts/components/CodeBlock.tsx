interface Props {
  code: string;
}

export default function CodeBlock({
  code,
}: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 overflow-auto">
      <pre className="text-green-300 whitespace-pre-wrap text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}