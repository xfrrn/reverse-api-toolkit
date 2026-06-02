from __future__ import annotations

import json
from typing import Any, Iterator
from urllib import request

from services.youdao.core.config import (
    DEFAULT_HEADERS,
    MODEL_LANGUAGE_NAMES,
    MODEL_TRANSLATE_ENDPOINT,
    normalize_language,
    normalize_model,
)
from services.youdao.core.exceptions import YoudaoError
from services.youdao.helpers.encoding import encode_multipart
from services.youdao.helpers.sse import iter_sse_events
from services.youdao.models.results import ModelTranslationResult


class ModelTranslateInterface:
    model_translate_endpoint = MODEL_TRANSLATE_ENDPOINT
    model_language_names = MODEL_LANGUAGE_NAMES

    @classmethod
    def stream_model_translate(
        cls,
        text: str,
        source: str = "auto",
        target: str = "auto",
        prompt: str = "",
        model: str = "lite",
        timeout: int = 60,
    ) -> Iterator[dict[str, Any]]:
        source_code = normalize_language(source, cls.model_language_names)
        target_code = normalize_language(target, cls.model_language_names)
        model_code = normalize_model(model)

        text = text.strip()
        if not text:
            raise ValueError("text cannot be empty")
        if len(text) > 1000:
            raise ValueError("the model translation web demo limits text to 1000 characters")

        body, content_type = encode_multipart(
            {
                "q": text,
                "from": source_code,
                "to": target_code,
                "prompt": prompt,
                "streamType": "increment",
                "handleOption": model_code,
            }
        )
        req = request.Request(
            cls.model_translate_endpoint,
            data=body,
            method="POST",
            headers={
                "Accept": "text/event-stream",
                "Content-Type": content_type,
                **DEFAULT_HEADERS,
            },
        )

        with request.urlopen(req, timeout=timeout) as resp:
            content_type = resp.headers.get("content-type", "")
            if not content_type.startswith("text/event-stream"):
                payload = resp.read().decode("utf-8", errors="replace")
                raise YoudaoError(f"unexpected response content-type {content_type}: {payload}")

            for event in iter_sse_events(resp):
                try:
                    payload = json.loads(event["data"])
                except json.JSONDecodeError as exc:
                    raise YoudaoError(f"invalid SSE data: {event['data']}") from exc

                code = str(payload.get("code", ""))
                if code and code != "0":
                    raise YoudaoError(f"youdao model translation returned code={code}: {payload}")
                yield payload

    @classmethod
    def model_translate(
        cls,
        text: str,
        source: str = "auto",
        target: str = "auto",
        prompt: str = "",
        model: str = "lite",
        timeout: int = 60,
    ) -> ModelTranslationResult:
        events: list[dict[str, Any]] = []
        chunks: list[str] = []

        for payload in cls.stream_model_translate(text, source, target, prompt, model, timeout):
            events.append(payload)
            chunks.append(str((payload.get("data") or {}).get("transIncre") or ""))

        return ModelTranslationResult(text="".join(chunks), events=events)
