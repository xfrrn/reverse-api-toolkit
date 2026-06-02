from __future__ import annotations

import json
from typing import Any
from urllib import request

from services.youdao.core.config import DEFAULT_HEADERS
from services.youdao.helpers.encoding import encode_multipart


def post_form_json(
    endpoint: str,
    fields: dict[str, str],
    accept: str = "application/json, text/plain, */*",
    timeout: int = 20,
) -> dict[str, Any]:
    body, content_type = encode_multipart(fields)
    req = request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "Accept": accept,
            "Content-Type": content_type,
            **DEFAULT_HEADERS,
        },
    )
    with request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))
