import json
from pathlib import Path
from typing import Any


class JsonService:
    """
    Service responsible for reading drills.json
    and retrieving drill definitions.
    """

    def __init__(self) -> None:

        self.data_file = (
            Path(__file__)
            .parent.parent
            / "data"
            / "java"
            / "drills.json"
        )

        self._cache = None

    def load(self) -> dict[str, Any]:
        """
        Load drills.json.

        Uses in-memory cache after
        the first read.
        """

        if self._cache is None:

            with open(
                self.data_file,
                "r",
                encoding="utf-8",
            ) as file:

                self._cache = json.load(file)

        return self._cache

    def reload(self) -> dict[str, Any]:
        """
        Force reload JSON.
        """

        self._cache = None

        return self.load()

    def get_category(
        self,
        category: str,
    ) -> list[dict]:
        """
        Return an entire category.

        Example:
            collections
            exceptions
            equals_hashCode
        """

        data = self.load()

        return data.get(category, [])

    def get_drill(
        self,
        drill_id: str,
    ) -> dict | None:
        """
        Find drill by id.

        Searches every category.
        """

        data = self.load()

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
    ) -> list[str]:
        """
        Return all category names.
        """

        return list(
            self.load().keys()
        )

    def all_drills(
        self,
    ) -> list[dict]:
        """
        Flatten every drill into
        one list.
        """

        result = []

        for drills in self.load().values():

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
    ) -> bool:
        """
        Returns True if drill exists.
        """

        return (
            self.get_drill(
                drill_id
            )
            is not None
        )