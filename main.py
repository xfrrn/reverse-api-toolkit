from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from services.youdao.api import router as youdao_router


app = FastAPI(
    title="Translation Request Wrapper",
    description="Categorized wrappers for captured translation network requests.",
    version="0.1.0",
)
app.include_router(youdao_router)
app.mount("/static", StaticFiles(directory="frontend"), name="static")


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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
