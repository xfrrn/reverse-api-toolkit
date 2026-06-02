from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class TextTranslationResult:
    text: str
    query: str
    translation: list[str]
    language_pair: str | None
    raw: dict[str, Any]


@dataclass(frozen=True)
class ModelTranslationResult:
    text: str
    events: list[dict[str, Any]]
