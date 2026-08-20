import { AssessmentData } from "./mockAssessment";
import { apiUrl } from "@/lib/api";

export async function fetchAssessment(
  language = "java",
  interviewerName: string
): Promise<AssessmentData> {
  try {
    const response = await fetch(
      apiUrl(`/api/mock-assessment/questions-stream?language=${encodeURIComponent(language)}&interviewer_name=${encodeURIComponent(interviewerName)}`),
      {
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await readAssessmentStream(response);
    
    // Validate response structure
    if (!data.assessmentId || !data.round1Questions || !data.round2Question) {
      throw new Error("Invalid response format from server");
    }
    
    if (!Array.isArray(data.round1Questions) || data.round1Questions.length === 0) {
      throw new Error("No questions returned from server");
    }

    return data as AssessmentData;
  } catch (error) {
    console.error("Assessment API Error:", error);
    throw error;
  }
}

async function readAssessmentStream(response: Response): Promise<AssessmentData> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`Failed to load mock assessment: ${errorData?.detail || `HTTP ${response.status}`}`);
  }

  const text = await response.text();
  const events = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as {
      status: string;
      status_code?: number;
      detail?: string;
      data?: AssessmentData;
    });
  const finalEvent = events.at(-1);

  if (!finalEvent || finalEvent.status !== "complete" || !finalEvent.data) {
    throw new Error(
      `Mock assessment API ${finalEvent?.status_code ?? 500}: ${finalEvent?.detail ?? "Question generation did not complete."}`
    );
  }

  return finalEvent.data;
}

export async function submitQuestion(
  assessmentId: string,
  questionNo: number,
  userCode: string,
  userAnalysis = "",
  round = 1
): Promise<{ message: string; assessmentId: string; questionId: string; submitted: boolean }> {
  try {
    const response = await fetch(
      apiUrl("/api/mock-assessment/evaluate"),
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessment_id: assessmentId,
          question_no: questionNo,
          round,
          user_code: userCode,
          user_analysis: userAnalysis,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Submit API Error:", error);
    throw error;
  }
}

export const evaluateQuestion = submitQuestion;
