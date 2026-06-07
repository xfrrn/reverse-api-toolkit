from typing import Any

from pydantic import BaseModel


class VideoParseResponse(BaseModel):
    provider: str
    category: str
    text: str
    medias: list[dict[str, Any]]
    overseas: Any | None = None
    raw: Any | None = None
