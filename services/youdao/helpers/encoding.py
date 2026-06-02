from __future__ import annotations

import uuid


def encode_multipart(fields: dict[str, str]) -> tuple[bytes, str]:
    boundary = f"----PythonFormBoundary{uuid.uuid4().hex}"
    body = bytearray()

    for name, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"))
        body.extend(value.encode("utf-8"))
        body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    return bytes(body), f"multipart/form-data; boundary={boundary}"


def repair_chinese_mojibake(value: str) -> str:
    """Repair a server-side GBK-as-CP949 mojibake seen on zh-CHS responses."""

    try:
        repaired = value.encode("cp949").decode("gbk")
    except UnicodeError:
        return value

    if any("\u4e00" <= char <= "\u9fff" for char in repaired):
        return repaired
    return value
