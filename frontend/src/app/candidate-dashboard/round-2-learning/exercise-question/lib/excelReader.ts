import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

import { ExerciseQuestion } from "./questionTypes";

export function loadExerciseQuestions(): ExerciseQuestion[] {
  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    "candidate-dashboard",
    "round-2-learning",
    "exercise-question",
    "questions",
    "java",
    "exercise-questions.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Excel file not found: ${filePath}`
    );
  }

  const fileBuffer = fs.readFileSync(filePath);

  const workbook = XLSX.read(fileBuffer, {
    type: "buffer",
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error(
      "No worksheet found in Excel file"
    );
  }

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<
    Record<string, unknown>
  >(worksheet, {
    defval: "",
  });

  return rows
    .map((row) => ({
      questionNo: Number(row.QuestionNo),
      title: String(row.title ?? ""),
      code: String(row.Code ?? ""),
    }))
    .filter(
      (question) =>
        question.questionNo > 0 &&
        question.title.trim() !== "" &&
        question.code.trim() !== ""
    );
}