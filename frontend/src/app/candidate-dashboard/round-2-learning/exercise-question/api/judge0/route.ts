import { NextRequest, NextResponse } from "next/server";
import languages from "../../../../../../config/languages.json";

export async function POST(
  request: NextRequest
) {
  try {

    const body = await request.json();

    const {
      sourceCode,
      language = "java",
      stdin = "",
    } = body;

    const selectedLanguage = languages.languages.find(
      (item) => item.id === language && item.enabled
    );

    if (!selectedLanguage) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    if (
      !sourceCode ||
      typeof sourceCode !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Source code is required",
        },
        {
          status: 400,
        }
      );
    }

    // Create submission
    const submissionResponse =
      await fetch(
        `${selectedLanguage.judge0URL}/submissions?base64_encoded=true&wait=false`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            language_id: selectedLanguage.judge0LanguageId,

            source_code:
              Buffer.from(
                sourceCode
              ).toString("base64"),

            stdin: stdin
              ? Buffer.from(
                  stdin
                ).toString("base64")
              : "",
          }),
        }
      );

    if (!submissionResponse.ok) {

      const text =
        await submissionResponse.text();

      return NextResponse.json(
        {
          error:
            text ||
            "Judge0 submission failed",
        },
        {
          status:
            submissionResponse.status,
        }
      );
    }

    const submission =
      await submissionResponse.json();

    const token =
      submission.token;

    if (!token) {

      return NextResponse.json(
        {
          error:
            "Judge0 did not return a token",
        },
        {
          status: 500,
        }
      );
    }

    // Wait for result
    let result = null;

    for (
      let attempt = 0;
      attempt < 30;
      attempt++
    ) {

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );

      const resultResponse =
        await fetch(
          `${selectedLanguage.judge0URL}/submissions/${token}?base64_encoded=true`,
          {
            cache: "no-store",
          }
        );

      if (!resultResponse.ok) {
        continue;
      }

      result =
        await resultResponse.json();

      /*
        Judge0 status:

        1 = In Queue
        2 = Processing
        3+ = Finished
      */

      if (
        result.status?.id >= 3
      ) {
        break;
      }
    }

    if (!result) {

      return NextResponse.json(
        {
          error:
            "No execution result received",
        },
        {
          status: 504,
        }
      );
    }

    return NextResponse.json({
      status: result.status,

      stdout: decodeBase64(
        result.stdout
      ),

      stderr: decodeBase64(
        result.stderr
      ),

      compileOutput:
        decodeBase64(
          result.compile_output
        ),

      message: decodeBase64(
        result.message
      ),

      time: result.time,

      memory: result.memory,
    });

  } catch (error) {

    console.error(
      "Judge0 error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Judge0 execution failed",
      },
      {
        status: 500,
      }
    );
  }
}

function decodeBase64(
  value?: string | null
): string {

  if (!value) {
    return "";
  }

  try {

    return Buffer.from(
      value,
      "base64"
    ).toString("utf-8");

  } catch {

    return value;

  }
}