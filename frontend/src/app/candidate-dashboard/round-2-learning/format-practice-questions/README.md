# Format & Practice Questions

Route:

```text
/format-practice-question
```

## Data sources

### Format

The Format tab is loaded from:

```text
public/format-practice-question/format.json
```

The JSON can contain any number of `details` and any number of `sections`.

Example:

```json
{
  "title": "Format",
  "description": "Coding debugging question with Java code, answer and explanation.",
  "details": [
    {
      "label": "Duration",
      "value": "30 minutes"
    },
    {
      "label": "Difficulty",
      "value": "Medium"
    }
  ],
  "sections": [
    {
      "title": "Instructions",
      "items": [
        {
          "label": "Language",
          "value": "Java"
        },
        {
          "label": "Task",
          "value": "Fix the bug and explain it."
        }
      ]
    }
  ]
}
```

You can add/remove details without changing the React component.

### Questions

Questions are loaded from:

```text
public/format-practice-question/questions.xlsx
```

The first Excel row is the header and is excluded automatically. Every subsequent non-empty row creates one question in the left pane.

## Install

```bash
npm install xlsx
```

No backend API is required for this screen.
