import { NextRequest, NextResponse } from "next/server";
import languages from "../../../../../../config/languages.json";

export async function POST(request: NextRequest) {
  try {
    const { sourceCode, language = "java", stdin = "" } = await request.json();
    const selectedLanguage = languages.languages.find((item) => item.id === language && item.enabled);

    if (!selectedLanguage) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }
    if (!sourceCode || typeof sourceCode !== "string") {
      return NextResponse.json({ error: "Source code is required" }, { status: 400 });
    }

    const submissionResponse = await fetch(
      `${selectedLanguage.practicejudge0URL}/submissions?base64_encoded=true&wait=false`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_id: selectedLanguage.practicejudge0LanguageId,
          source_code: Buffer.from(sourceCode).toString("base64"),
          stdin: stdin ? Buffer.from(stdin).toString("base64") : "",
        }),
      },
    );

    if (!submissionResponse.ok) {
      return NextResponse.json({ error: await submissionResponse.text() || "Judge0 submission failed" }, { status: submissionResponse.status });
    }

    const { token } = await submissionResponse.json();
    if (!token) return NextResponse.json({ error: "Judge0 did not return a token" }, { status: 502 });

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const resultResponse = await fetch(
        `${selectedLanguage.practicejudge0URL}/submissions/${token}?base64_encoded=true`,
        { cache: "no-store" },
      );
      if (!resultResponse.ok) continue;

      const result = await resultResponse.json();
      if (result.status?.id >= 3) {
        return NextResponse.json({
          status: result.status,
          stdout: decodeBase64(result.stdout),
          stderr: decodeBase64(result.stderr),
          compileOutput: decodeBase64(result.compile_output),
          message: decodeBase64(result.message),
          time: result.time,
        });
      }
    }

    return NextResponse.json({ error: "No execution result received" }, { status: 504 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Judge0 execution failed" }, { status: 500 });
  }
}

function decodeBase64(value?: string | null) {
  return value ? Buffer.from(value, "base64").toString("utf-8") : "";
}