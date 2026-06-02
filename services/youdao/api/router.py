from __future__ import annotations

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from services.youdao.api.dependencies import to_http_error
from services.youdao.interfaces.model_translate import ModelTranslateInterface
from services.youdao.interfaces.text_translate import TextTranslateInterface
from services.youdao.schemas.requests import ModelTranslateRequest, TextTranslateRequest
from services.youdao.schemas.responses import TranslateResponse


router = APIRouter(prefix="/youdao", tags=["youdao"])


@router.get("/languages")
def languages() -> dict[str, object]:
    return {
        "text_translate": TextTranslateInterface.text_language_names,
        "text_translate_directions": TextTranslateInterface.text_supported_directions,
        "model_translate": ModelTranslateInterface.model_language_names,
    }


@router.post("/text-translate", response_model=TranslateResponse)
def text_translate(payload: TextTranslateRequest) -> TranslateResponse:
    try:
        result = TextTranslateInterface.text_translate(
            text=payload.text,
            source=payload.source,
            target=payload.target,
        )
    except Exception as exc:
        raise to_http_error(exc) from exc

    return TranslateResponse(
        provider="youdao",
        category="text_translate",
        text=result.text,
        raw=result.raw if payload.raw else None,
    )


@router.post("/model-translate", response_model=TranslateResponse)
def model_translate(payload: ModelTranslateRequest) -> TranslateResponse:
    try:
        result = ModelTranslateInterface.model_translate(
            text=payload.text,
            source=payload.source,
            target=payload.target,
            prompt=payload.prompt,
            model=payload.model,
        )
    except Exception as exc:
        raise to_http_error(exc) from exc

    return TranslateResponse(
        provider="youdao",
        category="model_translate",
        text=result.text,
        raw=result.events if payload.raw else None,
    )


@router.post("/model-translate/stream")
def model_translate_stream(payload: ModelTranslateRequest) -> StreamingResponse:
    def event_stream():
        try:
            for event in ModelTranslateInterface.stream_model_translate(
                text=payload.text,
                source=payload.source,
                target=payload.target,
                prompt=payload.prompt,
                model=payload.model,
            ):
                if payload.raw:
                    data = event
                else:
                    data = {"text": str((event.get("data") or {}).get("transIncre") or "")}
                yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
        except Exception as exc:
            error = {"error": str(exc)}
            yield f"event: error\ndata: {json.dumps(error, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
