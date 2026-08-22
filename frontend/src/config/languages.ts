import manifest from "./languages.json";

export type SupportedLanguage = "java" | "node";

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  monacoLanguage: string;
  syntaxLanguage: string;
  fileExtension: string;
  judge0LanguageId: number;
  judge0URL: string;
  practicejudge0LanguageId: number;
  practicejudge0URL: string;
  enabled: boolean;
}

export const DEFAULT_LANGUAGE_ID: SupportedLanguage = "java";

export const languages = manifest.languages as LanguageConfig[];

export const enabledLanguages = languages.filter(
  (language) => language.enabled
);

export function getLanguage(
  id: string = DEFAULT_LANGUAGE_ID
): LanguageConfig {
  const normalizedId = id.trim().toLowerCase();
  const language = languages.find(
    (item) =>
      item.id.toLowerCase() === normalizedId ||
      item.name.toLowerCase() === normalizedId
  );

  if (!language) {
    throw new Error(`Unsupported language: ${id}`);
  }

  return language;
}
