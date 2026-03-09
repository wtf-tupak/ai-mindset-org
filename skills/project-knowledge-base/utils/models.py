from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal


@dataclass
class SourceResult:
    source: str
    data: list[dict[str, Any]]
    status: Literal["success", "partial", "error"] = "success"
    error_message: str | None = None

    @property
    def items_count(self) -> int:
        return len(self.data)

    @property
    def is_ok(self) -> bool:
        return self.status in ("success", "partial")
