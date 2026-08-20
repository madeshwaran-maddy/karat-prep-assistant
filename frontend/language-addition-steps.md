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

# Shared Language Configuration

When adding a language, update both manifests with the same `id` and `enabled` value:

1. Add the language to `frontend/src/config/languages.json` with its display name, Monaco language, Prism `syntaxLanguage`, file extension, Judge0 language ID, Judge0 URL, and `enabled` status.
2. Add the language ID to the `SupportedLanguage` union in `frontend/src/config/languages.ts`.
3. Add the matching language entry to `backend/config/languages.json`. The backend entry must include the language ID, name, file extension, Judge0 language ID, Judge0 URL, and `enabled` status.
4. Keep the IDs, file extensions, Judge0 values, and enabled state consistent across both manifests. Do not reuse an existing concept, topic, drill, or question ID.

## Debugging Drill Screen

When adding a new language to the Round 1 Debugging Drill:

1. Create `frontend/src/app/candidate-dashboard/round-1-learning/debugging-drill/data/<language-id>/drills.json` using the existing drill structure. Each drill needs a unique `id`, `title`, `difficulty`, and `prompt` containing `topic`, `bugTypes`, and `rules`.
2. Import the dataset in `frontend/src/app/candidate-dashboard/round-1-learning/debugging-drill/services/debuggingApi.ts` and add it to the `dataByLanguage` map.
3. Create backend drill data at `backend/debugging_drill/data/<language-id>/drills.json` with the same language-specific drill content and IDs.
4. Create both backend prompt templates at:
	- `backend/debugging_drill/prompts/<language-id>/generate_prompt.txt`
	- `backend/debugging_drill/prompts/<language-id>/evaluate_prompt.txt`
5. Ensure generated code uses the new language syntax and file extension. The backend prompt service selects templates by language ID, and the backend route validates the ID against `backend/config/languages.json`.
6. Verify that the drill list loads for the selected language, a question can be generated, code and analysis can be submitted, evaluation completes, and the editor uses the configured Monaco language.

## Mock Assessment Screen

Mock Assessment combines the Debugging Drill assets above with a Round 2 Excel question:

1. Complete the Debugging Drill steps for the new language. Round 1 questions are generated from `backend/debugging_drill/data/<language-id>/drills.json` and the matching prompt templates.
2. Create `backend/mock_assessment/data/<language-id>/round2_questions.xlsx` using the existing workbook columns: `QuestionNo`, `title`, and `Code`. Include at least one non-empty valid row.
3. Confirm the backend mock-assessment route receives the new language ID and selects the new workbook. Do not hard-code the Java workbook path.
4. Verify that the assessment loads language-appropriate Round 1 and Round 2 questions, uses the new file extension, submits both rounds, and returns the correct language in the response.

## Round 2 Exercise Question Screen

1. Create `backend/exercise-question/<language-id>/exercise-questions.xlsx` using the existing workbook columns: `QuestionNo`, `title`, and `Code`.
2. Add the new language to `backend/config/languages.json` so `/api/assessments/start-exercise-question?language=<language-id>` accepts it and selects the correct workbook.
3. If the frontend `loadExerciseQuestions()` helper in `frontend/src/app/candidate-dashboard/round-2-learning/exercise-question/lib/excelReader.ts` is used, change it to accept a language ID and resolve `questions/<language-id>/exercise-questions.xlsx`; do not leave the Java path hard-coded.
4. Ensure the exercise editor uses `language.monacoLanguage`, the submission uses `language.id`, and the Judge0 route uses the new language's configured Judge0 values.
5. Verify that the exercise question loads for the selected language, displays the correct code, executes successfully where Judge0 supports it, and reports execution errors without falling back to Java content.

# Round 2 Learning
## Format and Practice Questions Screen

1. Create a new folder under `frontend/public/format-practice-question/<language-id>`.
2. Add `format.json` and `questions.xlsx` to that folder, following the existing Java/Node formats. `format.json` must contain a `title`; the workbook's first row is the header and each later non-empty row is a question.
3. The screen loads these files from `/format-practice-question/${language.id}/format.json` and `/format-practice-question/${language.id}/questions.xlsx`, so the folder name must exactly match the language ID.
4. Use language-appropriate wording and code in both files. Keep question numbering valid and sequential, and ensure every workbook question has the columns required by the existing Excel parser.
5. Verify that the format content and first question load for the new language, all questions can be navigated, and Round 2 progress starts, updates, completes, and restores after reopening the tab.

## Round 2 Progress and Navigation

For every language-dependent Round 2 screen:

1. Pass the selected `language.id` to API requests and progress hooks; never use the default Java value when the selected language is available.
2. Verify direct navigation, reloads, previous/next controls, completion state, and progress restoration with the new language selected.

## End-to-End Checklist

Before enabling the language for candidates:

- Both frontend and backend manifests contain the language and agree on its ID and execution settings.
- Concepts, Practice Questions, Debugging Drill, Mock Assessment, Round 2 Format, and Round 2 Exercise Question each have language-specific content where applicable.
- No dataset loader or API route still points unconditionally to Java data.
- Syntax highlighting, Monaco editing, generated filenames, and Judge0 execution use the new language configuration.
- Progress is isolated by the existing language-aware keys and does not reuse unrelated IDs.
- The language is tested with a fresh candidate session and with an existing saved-progress session.
