from fastapi import APIRouter

from services.snapany.api.dependencies import to_http_error
from services.snapany.interfaces.video_parse import VideoParseInterface
from services.snapany.schemas.requests import VideoParseRequest
from services.snapany.schemas.responses import VideoParseResponse


router = APIRouter(prefix="/snapany", tags=["snapany"])


@router.post("/video-parse", response_model=VideoParseResponse)
def video_parse(payload: VideoParseRequest) -> VideoParseResponse:
    try:
        result = VideoParseInterface.parse_video(
            link=str(payload.link),
            locale=payload.locale,
            timezone=payload.timezone,
        )
    except Exception as exc:
        raise to_http_error(exc) from exc

    return VideoParseResponse(
        provider="snapany",
        category="video_parse",
        text=result.text,
        medias=result.medias,
        overseas=result.overseas,
        raw=result.raw if payload.raw else None,
    )
