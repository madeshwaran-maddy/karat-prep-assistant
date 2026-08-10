import type { FormatConfig } from "../types";

export async function loadFormat(url: string): Promise<FormatConfig> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Format JSON could not be loaded (${response.status}).`);
  }

  const data = (await response.json()) as FormatConfig;

  if (!data.title) {
    throw new Error("format.json must contain a title.");
  }

  return {
    title: data.title,
    description: data.description || "",
    details: Array.isArray(data.details) ? data.details : [],
    sections: Array.isArray(data.sections) ? data.sections : [],
  };
}
