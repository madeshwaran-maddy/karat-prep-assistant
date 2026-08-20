import {
    Drill,
    EvaluateRequest,
    EvaluateResponse,
    GenerateRequest,
    GenerateResponse
} from "../types/drill";
import drills from "../data/java/drills.json";
import nodeDrills from "../data/node/drills.json";
import type { SupportedLanguage } from "../../../../../config/languages";
import { apiUrl } from "@/lib/api";

const BASE_URL = apiUrl("/debugging-drill");

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const responseText = await response.text();
        let detail = responseText;

        try {
            const payload = JSON.parse(responseText) as { detail?: unknown };
            if (typeof payload.detail === "string") {
                detail = payload.detail;
            }
        } catch {
            // Preserve non-JSON proxy responses such as Next.js errors.
        }

        throw new Error(`Debugging API ${response.status}: ${detail || response.statusText}`);
    }

    return response.json();
}

export async function generateQuestion(
    request: GenerateRequest
): Promise<GenerateResponse> {

    const response = await fetch(`${BASE_URL}/generate-stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(request)
    });

    const payload = await handleGenerateStream(response);

    if (!payload || typeof payload !== "object" || typeof (payload as { code?: unknown }).code !== "string") {
        throw new Error("Generated question response does not contain a code field.");
    }

    const { code } = payload as GenerateResponse;
    return {
        ...(payload as Omit<GenerateResponse, "code">),
        code,
    };
}

export async function evaluateQuestion(
    request: EvaluateRequest
): Promise<EvaluateResponse> {

    const response = await fetch(`${BASE_URL}/evaluate-stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(request)
    });

    return handleEvaluationStream(response);
}

export async function loadDrills(language: SupportedLanguage = "java") {
    const dataByLanguage: Record<SupportedLanguage, Record<string, Drill[]>> = {
        java: drills as Record<string, Drill[]>,
        node: nodeDrills as Record<string, Drill[]>,
    };

    return dataByLanguage[language] ?? {};
}

async function handleGenerateStream(response: Response): Promise<GenerateResponse> {
    if (!response.ok) {
        await handleResponse<unknown>(response);
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
            data?: GenerateResponse;
        });
    const finalEvent = events.at(-1);

    if (!finalEvent || finalEvent.status !== "complete" || !finalEvent.data) {
        throw new Error(
            `Debugging API ${finalEvent?.status_code ?? 500}: ${finalEvent?.detail ?? "Generation did not complete."}`
        );
    }

    return finalEvent.data;
}

async function handleEvaluationStream(response: Response): Promise<EvaluateResponse> {
    if (!response.ok) {
        await handleResponse<unknown>(response);
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
            data?: EvaluateResponse;
        });
    const finalEvent = events.at(-1);

    if (!finalEvent || finalEvent.status !== "complete" || !finalEvent.data) {
        throw new Error(
            `Debugging API ${finalEvent?.status_code ?? 500}: ${finalEvent?.detail ?? "Evaluation did not complete."}`
        );
    }

    return finalEvent.data;
}