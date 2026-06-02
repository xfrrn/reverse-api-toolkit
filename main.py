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
    return FileResponse("frontend/index.html")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
