import {
  AssessmentData,
  EvaluationResult,
} from "./mockAssessment";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function fetchAssessment(): Promise<AssessmentData> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/mock-assessment/questions`,
      { 
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.detail || `HTTP ${response.status}`;
      throw new Error(`Failed to load mock assessment: ${errorMessage}`);
    }

    const data = await response.json();
    
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

export async function evaluateQuestion(
  assessmentId: string,
  questionNo: number,
  userCode: string
): Promise<EvaluationResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/mock-assessment/evaluate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assessment_id: assessmentId,
          question_no: questionNo,
          user_code: userCode,
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
    console.error("Evaluation API Error:", error);
    throw error;
  }
}
