export interface Concept {
  id: string;
  title: string;
  explanation: string[];
  keyConcepts: string[];
  commonMistakes: string[];
  codeExample: string;
  debuggingScenario: string[];
}

export interface ConceptsData {
  collections: Concept[];
}