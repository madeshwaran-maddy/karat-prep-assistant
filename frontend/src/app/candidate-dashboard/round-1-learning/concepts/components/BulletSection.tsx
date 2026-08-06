interface Props {
  title: string;
  items: string[];
}

export default function BulletSection({
  title,
  items,
}: Props) {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-semibold mb-3">
        {title}
      </h3>

      <ul className="list-disc ml-6 space-y-2 text-gray-700">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}