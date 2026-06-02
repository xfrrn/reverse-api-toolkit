from typing import Any

from pydantic import BaseModel


class TranslateResponse(BaseModel):
    provider: str
    category: str
    text: str
    raw: Any | None = None
