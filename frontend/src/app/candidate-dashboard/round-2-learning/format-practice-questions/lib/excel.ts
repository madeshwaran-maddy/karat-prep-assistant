import * as XLSX from "xlsx";
import type { PracticeQuestion } from "../types";

function cleanKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function getValue(
  row: Record<string, unknown>,
  aliases: string[]
): string {
  const entry = Object.entries(row).find(([key]) =>
    aliases.includes(cleanKey(key))
  );

  return String(entry?.[1] ?? "").trim();
}

export async function loadQuestionsFromExcel(
  url: string
): Promise<PracticeQuestion[]> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Excel file could not be loaded (${response.status}).`);
  }

  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("The Excel workbook does not contain a sheet.");
  }

  const worksheet = workbook.Sheets[firstSheetName];

  // The first Excel row becomes the header.
  // Only the rows after the header are returned as questions.
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    {
      defval: "",
    }
  );

  return rows.map((row, index) => {
    const questionNoRaw = getValue(row, [
      "questionno",
      "questionnumber",
      "no",
      "number",
    ]);

    const parsedQuestionNo = Number(questionNoRaw);

    return {
      id:
        getValue(row, ["id", "questionid"]) ||
        `question-${index + 1}`,

      questionNo: Number.isFinite(parsedQuestionNo)
        ? parsedQuestionNo
        : index + 1,

      title:
        getValue(row, ["title", "subtitle", "description"]) ||
        "Coding debugging question with Java code, answer and explanation.",

      question: getValue(row, [
        "question",
        "buggycode",
        "code",
        "questioncode",
      ]),

      answer: getValue(row, [
        "answer",
        "solution",
        "answercode",
        "solutioncode",
      ]),

      explanation: getValue(row, [
        "explanation",
        "reason",
        "details",
      ]),
    };
  });
}
