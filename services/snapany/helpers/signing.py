from __future__ import annotations

import hashlib
import hmac
import time

from services.snapany.core.config import SIGNING_KEY


def timestamp_ms() -> str:
    return str(int(time.time() * 1000))


def sign_footer(link: str, locale: str, timestamp: str) -> str:
    message = f"{link}{locale}{timestamp}".encode("utf-8")
    return hmac.new(SIGNING_KEY.encode("utf-8"), message, hashlib.sha256).hexdigest()


def make_signed_headers(link: str, locale: str) -> dict[str, str]:
    timestamp = timestamp_ms()
    return {
        "Accept-Language": locale,
        "G-Timestamp": timestamp,
        "G-Footer": sign_footer(link, locale, timestamp),
    }
