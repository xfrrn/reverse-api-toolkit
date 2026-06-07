from __future__ import annotations


class SnapAnyError(RuntimeError):
    """Raised when the SnapAny endpoint returns an error."""

    def __init__(
        self,
        message: str,
        status_code: int = 502,
        upstream_status_code: int | None = None,
        upstream_code: str | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.upstream_status_code = upstream_status_code
        self.upstream_code = upstream_code

    @property
    def detail(self) -> dict[str, object]:
        detail: dict[str, object] = {"message": str(self)}
        if self.upstream_status_code is not None:
            detail["upstream_status_code"] = self.upstream_status_code
        if self.upstream_code:
            detail["upstream_code"] = self.upstream_code
        return detail
