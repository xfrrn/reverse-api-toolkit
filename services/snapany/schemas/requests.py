from pydantic import AnyUrl, BaseModel, Field


class VideoParseRequest(BaseModel):
    link: AnyUrl
    locale: str = Field(default="zh", min_length=2, max_length=16)
    timezone: str = Field(default="Asia/Shanghai", min_length=1, max_length=64)
    raw: bool = False
