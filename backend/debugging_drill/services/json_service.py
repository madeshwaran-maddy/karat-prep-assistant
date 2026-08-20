import json
from pathlib import Path
from typing import Any


class JsonService:
    """
    Service responsible for reading drills.json
    and retrieving drill definitions.
    """

    def __init__(self) -> None:
        self.data_dir = Path(__file__).parent.parent / "data"
        self._cache: dict[str, dict[str, Any]] = {}

    def load(self, language: str = "java") -> dict[str, Any]:
        """
        Load drills.json.

        Uses in-memory cache after
        the first read.
        """

        language_id = language.strip().lower()
        if language_id not in self._cache:
            data_file = self.data_dir / language_id / "drills.json"

            with open(
                data_file,
                "r",
                encoding="utf-8",
            ) as file:

                self._cache[language_id] = json.load(file)

        return self._cache[language_id]

    def reload(self, language: str = "java") -> dict[str, Any]:
        """
        Force reload JSON.
        """

        self._cache.pop(language.strip().lower(), None)

        return self.load(language)

    def get_category(
        self,
        category: str,
        language: str = "java",
    ) -> list[dict]:
        """
        Return an entire category.

        Example:
            collections
            exceptions
            equals_hashCode
        """

        data = self.load(language)

        return data.get(category, [])

    def get_drill(
        self,
        drill_id: str,
        language: str = "java",
    ) -> dict | None:
        """
        Find drill by id.

        Searches every category.
        """

        data = self.load(language)

        for drills in data.values():

            if not isinstance(
                drills,
                list,
            ):
                continue

            for drill in drills:

                if (
                    drill.get("id")
                    == drill_id
                ):
                    return drill

        return None

    def categories(
        self,
        language: str = "java",
    ) -> list[str]:
        """
        Return all category names.
        """

        return list(self.load(language).keys())

    def all_drills(
        self,
        language: str = "java",
    ) -> list[dict]:
        """
        Flatten every drill into
        one list.
        """

        result = []

        for drills in self.load(language).values():

            if isinstance(
                drills,
                list,
            ):
                result.extend(
                    drills
                )

        return result

    def exists(
        self,
        drill_id: str,
        language: str = "java",
    ) -> bool:
        """
        Returns True if drill exists.
        """

        return (
            self.get_drill(drill_id, language)
            is not None
        )