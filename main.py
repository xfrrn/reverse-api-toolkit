from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from services.snapany.api import router as snapany_router
from services.youdao.api import router as youdao_router


app = FastAPI(
    title="Reverse API Toolkit",
    description="Categorized wrappers for captured network requests.",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)
app.include_router(snapany_router)
app.include_router(youdao_router)
@app.get("/")
def index() -> FileResponse:
    return FileResponse("frontend/pages/index.html")


@app.get("/plugins/youdao")
def youdao_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/youdao.html")


@app.get("/plugins/youdao/text")
def youdao_text_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/youdao/text.html")


@app.get("/plugins/youdao/model")
def youdao_model_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/youdao/model.html")


@app.get("/plugins/youdao/languages")
def youdao_languages_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/youdao/languages.html")


@app.get("/plugins/snapany")
def snapany_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/snapany.html")


@app.get("/plugins/snapany/video-parse")
def snapany_video_parse_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/snapany/video-parse.html")


@app.get("/plugins/devtools")
def devtools_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/devtools.html")


@app.get("/plugins/devtools/api-tester")
def devtools_api_tester_plugin() -> FileResponse:
    return FileResponse("frontend/pages/plugins/devtools/api-tester.html")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Must be last — FastAPI matches routes in order. Explicit routes first, static fallback last.
app.mount("/", StaticFiles(directory="frontend"), name="static")
