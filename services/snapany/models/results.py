from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class VideoParseResult:
    text: str
    medias: list[dict[str, Any]]
    overseas: Any | None
    raw: dict[str, Any]
