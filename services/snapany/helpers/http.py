from __future__ import annotations

import json
from typing import Any
from urllib import error, request

from services.snapany.core.config import DEFAULT_HEADERS
from services.snapany.core.exceptions import SnapAnyError
from services.snapany.helpers.signing import make_signed_headers


def _decode_json_response(body: bytes) -> dict[str, Any]:
    if not body:
        return {}
    try:
        payload = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise SnapAnyError(f"snapany returned a non-json response: {body[:200]!r}") from exc
    if not isinstance(payload, dict):
        raise SnapAnyError(f"snapany returned an unexpected response: {payload!r}")
    return payload


def _raise_upstream_error(status_code: int, payload: dict[str, Any]) -> None:
    message = str(payload.get("message") or payload)
    upstream_code = payload.get("code")
    upstream_code_text = str(upstream_code) if upstream_code is not None else None

    if upstream_code_text == "ShowLimitTip":
        raise SnapAnyError(
            message,
            status_code=429,
            upstream_status_code=status_code,
            upstream_code=upstream_code_text,
        )

    raise SnapAnyError(
        message,
        status_code=502,
        upstream_status_code=status_code,
        upstream_code=upstream_code_text,
    )


def post_extract_json(
    endpoint: str,
    link: str,
    locale: str,
    timezone: str,
    timeout: int = 30,
) -> dict[str, Any]:
    body = json.dumps({"link": link}, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    headers = {
        **DEFAULT_HEADERS,
        "G-Timezone": timezone,
        **make_signed_headers(link, locale),
    }
    req = request.Request(endpoint, data=body, method="POST", headers=headers)

    try:
        with request.urlopen(req, timeout=timeout) as resp:
            payload = _decode_json_response(resp.read())
    except error.HTTPError as exc:
        payload = _decode_json_response(exc.read())
        _raise_upstream_error(exc.code, payload)
    except error.URLError as exc:
        raise SnapAnyError(f"snapany request failed: {exc}") from exc

    if "code" in payload and payload.get("code") not in {0, "0", None}:
        _raise_upstream_error(200, payload)

    return payload
