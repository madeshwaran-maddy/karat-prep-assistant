import { Drill } from "../types/drill";

export function buildPrompt(drill: Drill): string {

    const bugList = drill.prompt.bugTypes
        .map((bug) => `- ${bug}`)
        .join("\n");

    const rules = drill.prompt.rules
        .map((rule) => `- ${rule}`)
        .join("\n");

    return `
Generate one Java debugging question.

Topic:
${drill.prompt.topic}

Possible Bug Types:
${bugList}

Rules:
${rules}
`;
}