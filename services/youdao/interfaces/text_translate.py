from __future__ import annotations

from services.youdao.helpers.encoding import repair_chinese_mojibake
from services.youdao.helpers.http import post_form_json
from services.youdao.core.config import TEXT_LANGUAGE_NAMES, TEXT_TRANSLATE_ENDPOINT, normalize_language
from services.youdao.core.exceptions import YoudaoError
from services.youdao.models.results import TextTranslationResult


class TextTranslateInterface:
    text_translate_endpoint = TEXT_TRANSLATE_ENDPOINT
    text_language_names = TEXT_LANGUAGE_NAMES
    text_supported_directions = [
        *[
            {"label": f"中文 » {name}", "source": "zh-CHS", "target": code}
            for code, name in TEXT_LANGUAGE_NAMES.items()
            if code not in {"auto", "zh-CHS"}
        ],
        *[
            {"label": f"{name} » 中文", "source": code, "target": "zh-CHS"}
            for code, name in TEXT_LANGUAGE_NAMES.items()
            if code not in {"auto", "zh-CHS"}
        ],
    ]

    @classmethod
    def validate_text_pair(cls, source: str, target: str) -> None:
        if source == "auto" or target == "auto" or source == target:
            return
        if source == "zh-CHS" or target == "zh-CHS":
            return
        raise ValueError(
            "text translation demo supports auto detection, same-language requests, "
            "or translations between Chinese (zh-CHS) and another listed language"
        )

    @classmethod
    def text_translate(
        cls,
        text: str,
        source: str = "auto",
        target: str = "auto",
        timeout: int = 20,
    ) -> TextTranslationResult:
        source_code = normalize_language(source, cls.text_language_names)
        target_code = normalize_language(target, cls.text_language_names)
        cls.validate_text_pair(source_code, target_code)

        text = text.strip()
        if not text:
            raise ValueError("text cannot be empty")
        if len(text) > 800:
            raise ValueError("the text translation web demo limits text to 800 characters")

        payload = post_form_json(
            cls.text_translate_endpoint,
            {
                "q": text,
                "from": source_code,
                "to": target_code,
            },
            timeout=timeout,
        )

        error_code = str(payload.get("errorCode", ""))
        if error_code != "0":
            raise YoudaoError(f"youdao text translation returned errorCode={error_code}: {payload}")

        translation = payload.get("translation") or []
        if not isinstance(translation, list):
            translation = [str(translation)]

        translated_items = [str(item) for item in translation]
        if target_code == "zh-CHS":
            translated_items = [repair_chinese_mojibake(item) for item in translated_items]
            payload["translation"] = translated_items

        return TextTranslationResult(
            text="\n".join(translated_items),
            query=str(payload.get("query", text)),
            translation=translated_items,
            language_pair=payload.get("l"),
            raw=payload,
        )
