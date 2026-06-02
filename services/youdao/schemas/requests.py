from typing import Literal

from pydantic import BaseModel, Field


class TextTranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    source: str = "auto"
    target: str = "auto"
    raw: bool = False


class ModelTranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=800)
    source: str = "auto"
    target: str = "auto"
    prompt: str = ""
    model: Literal["lite", "pro", "3", "0"] = "lite"
    raw: bool = False
