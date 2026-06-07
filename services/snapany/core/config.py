EXTRACT_POST_ENDPOINT = "https://api.snapany.com/v1/extract/post"

SIGNING_KEY = "a5wU-SVyy5gXIyMbPQIfIz7UP7rCBp76U8Z8i-FtDMU"

SUPPORTED_LOCALES: dict[str, str] = {
    "en": "English",
    "zh": "Simplified Chinese",
    "zh-Hant": "Traditional Chinese",
    "es": "Spanish",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "fr": "French",
    "de": "German",
    "it": "Italian",
}

LOCALE_ALIASES: dict[str, str] = {
    "zh-CN": "zh",
    "zh-cn": "zh",
    "cn": "zh",
    "chinese": "zh",
    "zh-TW": "zh-Hant",
    "zh-tw": "zh-Hant",
    "traditional": "zh-Hant",
}

DEFAULT_HEADERS: dict[str, str] = {
    "Accept": "*/*",
    "Content-Type": "application/json",
    "Origin": "https://snapany.com",
    "Referer": "https://snapany.com/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/148.0.0.0 Safari/537.36"
    ),
}


def normalize_locale(value: str) -> str:
    locale = value.strip()
    normalized = LOCALE_ALIASES.get(locale) or LOCALE_ALIASES.get(locale.lower()) or locale
    if normalized not in SUPPORTED_LOCALES:
        choices = ", ".join(SUPPORTED_LOCALES)
        raise ValueError(f"unsupported locale {value!r}; available codes: {choices}")
    return normalized
