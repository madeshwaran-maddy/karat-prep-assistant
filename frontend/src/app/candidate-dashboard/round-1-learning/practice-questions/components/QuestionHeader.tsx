interface Props {
  title: string;
  questionNo: number;
}

export default function QuestionHeader({
  title,
  questionNo,
}: Props) {
  return (
    <div className="border-b pb-5">

      <h1 className="text-3xl font-bold">
        {title}
      </h1>

      <p className="mt-2 text-gray-500">
        Practice Question {questionNo}
      </p>

    </div>
  );
}