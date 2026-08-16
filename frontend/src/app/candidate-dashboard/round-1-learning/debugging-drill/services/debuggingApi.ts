import {
    Drill,
    EvaluateRequest,
    EvaluateResponse,
    GenerateRequest,
    GenerateResponse
} from "../types/drill";
import drills from "../drills.json";

const BASE_URL = "http://localhost:8000/debugging-drill";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function generateQuestion(
    request: GenerateRequest
): Promise<GenerateResponse> {

    const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(request)
    });

    return handleResponse<GenerateResponse>(response);
}

export async function evaluateQuestion(
    request: EvaluateRequest
): Promise<EvaluateResponse> {

    const response = await fetch(`${BASE_URL}/evaluate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(request)
    });

    return handleResponse<EvaluateResponse>(response);
}

export async function loadDrills() {
    return drills as Record<string, Drill[]>;
}