from __future__ import annotations

from urllib.parse import urlparse

from services.snapany.core.config import EXTRACT_POST_ENDPOINT, normalize_locale
from services.snapany.helpers.http import post_extract_json
from services.snapany.models.results import VideoParseResult


class VideoParseInterface:
    extract_post_endpoint = EXTRACT_POST_ENDPOINT

    @classmethod
    def parse_video(
        cls,
        link: str,
        locale: str = "zh",
        timezone: str = "Asia/Shanghai",
        timeout: int = 30,
    ) -> VideoParseResult:
        link = link.strip()
        if not link:
            raise ValueError("link cannot be empty")

        parsed = urlparse(link)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("link must be an absolute http or https URL")

        locale_code = normalize_locale(locale)
        payload = post_extract_json(
            cls.extract_post_endpoint,
            link=link,
            locale=locale_code,
            timezone=timezone.strip() or "Asia/Shanghai",
            timeout=timeout,
        )

        medias = payload.get("medias") or []
        if not isinstance(medias, list):
            medias = []

        return VideoParseResult(
            text=str(payload.get("text") or ""),
            medias=[item for item in medias if isinstance(item, dict)],
            overseas=payload.get("overseas"),
            raw=payload,
        )
