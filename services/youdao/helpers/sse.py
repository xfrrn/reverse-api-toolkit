from __future__ import annotations

from typing import Any, Iterator


def iter_sse_events(resp: Any) -> Iterator[dict[str, str]]:
    event = "message"
    data_lines: list[str] = []
    event_id = ""

    for raw_line in resp:
        line = raw_line.decode("utf-8", errors="replace").rstrip("\r\n")
        if not line:
            if data_lines:
                yield {
                    "event": event,
                    "data": "\n".join(data_lines),
                    "id": event_id,
                }
            event = "message"
            data_lines = []
            event_id = ""
            continue

        if line.startswith(":"):
            continue

        field, _, value = line.partition(":")
        if value.startswith(" "):
            value = value[1:]
        if field == "event":
            event = value
        elif field == "data":
            data_lines.append(value)
        elif field == "id":
            event_id = value
