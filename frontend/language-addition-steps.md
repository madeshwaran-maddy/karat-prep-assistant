# Round 1 Learning:
## Concepts Screen:

When adding a new language to the Concepts screen:

1. Add the language to `frontend/src/config/languages.json` with a unique `id`, display name, language metadata, Judge0 details, and `enabled` status.

2. Add the new language ID to `frontend/src/config/languages.ts`:

	 ```ts
	 export type SupportedLanguage = "java" | "node" | "new-language";
	 ```

3. Create the language data file:

	 `frontend/src/app/candidate-dashboard/round-1-learning/concepts/data/<language-id>/concepts.json`

4. Register the dataset in `frontend/src/app/candidate-dashboard/round-1-learning/concepts/page.tsx`:

	 ```ts
	 import newLanguageData from "./data/new-language/concepts.json";

	 const conceptDataByLanguage = {
		 java: javaData,
		 node: nodeData,
		 "new-language": newLanguageData,
	 };
	 ```

5. Add section titles to `sectionTitleMap` when the new dataset uses category keys that need custom display names. Otherwise, section names are generated automatically from the JSON keys.

6. Each concept must include these required fields:

	 - `id`
	 - `title`
	 - `explanation`
	 - `keyConcepts`
	 - `commonMistakes`
	 - `codeExample`
	 - `debuggingScenario`

	 Optional fields include `summary`, `learningObjectives`, `detailSections`, `complexityTable`, `interviewChecklist`, and `officialReferences`.

7. Use the existing JSON structure. The top-level category values must be arrays of concept objects, for example:

	 ```json
	 {
		 "dataStructures": [
			 {
				 "id": "new-language-data-structures",
				 "title": "Data Structures",
				 "summary": "...",
				 "learningObjectives": ["..."],
				 "explanation": ["...", "...", "..."],
				 "detailSections": [
					 {
						 "title": "Simple meaning",
						 "paragraphs": ["..."],
						 "bullets": ["..."],
						 "note": "...",
						 "codeExample": "..."
					 }
				 ],
				 "complexityTable": {
					 "title": "Complexity and behavior",
					 "headers": ["Operation", "Typical cost", "Why"],
					 "rows": [["Lookup", "O(1)", "..."]]
				 },
				 "keyConcepts": ["..."],
				 "commonMistakes": ["..."],
				 "codeExample": "...",
				 "debuggingScenario": ["..."],
				 "interviewChecklist": ["..."],
				 "officialReferences": [
					 {
						 "title": "Official documentation",
						 "url": "https://..."
					 }
				 ]
			 }
		 ]
	 }
	 ```

8. Ensure every concept ID is unique. Concept progress is stored by `concept_id` in the backend, so do not reuse IDs for unrelated concepts or languages.

9. Verify that the new language loads the Concepts screen, displays the first concept, tracks progress, marks concepts complete, and navigates to the next concept.

## Practice Questions Screen:

When adding a new language to the Practice Questions screen:

1. Add the language to `frontend/src/config/languages.json` with a unique `id`, display name, language metadata, Judge0 details, and `enabled` status.

2. Add the new language ID to `frontend/src/config/languages.ts`:

	```ts
	export type SupportedLanguage = "java" | "node" | "new-language";
	```

3. Create the language question dataset:

	`frontend/src/app/candidate-dashboard/round-1-learning/practice-questions/data/<language-id>/practice-questions.json`

4. Import and register the dataset in `frontend/src/app/candidate-dashboard/round-1-learning/practice-questions/services/PracticeQuestionService.ts`:

	```ts
	import newLanguagePracticeData from "../data/new-language/practice-questions.json";

	private readonly dataByLanguage: Record<SupportedLanguage, PracticeData> = {
	  java: normalizePracticeData(javaPracticeData),
	  node: normalizePracticeData(nodePracticeData),
	  "new-language": normalizePracticeData(newLanguagePracticeData),
	};
	```

5. Use the existing JSON structure. Each top-level property is a section containing topic objects:

	```json
	{
	  "dataStructures": [
	    {
	      "id": "new-language-data-structures",
	      "title": "Data Structures",
	      "summary": "...",
	      "learningGoals": ["..."],
	      "questions": [
	        {
	          "questionNo": 1,
	          "title": "...",
	          "difficulty": "Easy",
	          "task": "...",
	          "expectedBehavior": "...",
	          "buggyCode": "...",
	          "answer": "...",
	          "explanation": "...",
	          "hints": ["..."],
	          "correctedCode": "...",
	          "keyTakeaways": ["..."],
	          "followUpQuestions": ["..."]
	        }
	      ]
	    }
	  ]
	}
	```

	The normalizer also supports topics nested under a `subtopics` array, as used by the Node.js dataset.

6. Each topic must include:

	- `id`
	- `title`
	- `questions`

	Each question must include:

	- `questionNo`
	- `buggyCode`
	- `answer`
	- `explanation`

	Optional fields include `summary`, `learningGoals`, `title`, `difficulty`, `task`, `expectedBehavior`, `hints`, `correctedCode`, `keyTakeaways`, and `followUpQuestions`.

7. Use only `Easy`, `Medium`, or `Hard` for the `difficulty` value. Keep question numbering sequential within each topic and ensure topic IDs are unique within the language dataset.

8. The selected language is already passed to the Practice Questions service and progress hook. Ensure the new language uses the same section/topic/question structure so progress can be restored correctly.

9. The code viewer uses `language.syntaxLanguage` from `languages.json` for syntax highlighting. Set this value to the correct supported Prism language identifier for the new language.

10. Verify that the new language:

	- Loads the correct question dataset.
	- Displays the first section, topic, and question.
	- Shows the correct syntax highlighting.
	- Supports previous/next question and topic navigation.
	- Starts, updates, and completes question progress.
	- Restores progress after reopening the tab.
	- Executes code successfully with the configured Judge0 language ID and URL, where code execution is supported.

11. If `getSections()` in `PracticeQuestionService.ts` is used by future UI code, make it accept a language ID and return sections from that language instead of always returning Java sections.

# Round 2 Larning:
## Format and Practice Questions Screen:

1. Create a new folder under frontend/public/format-practice-question/language_name.
2. 2 files needs to be created. [format.json and questions.xlsx] with same format
