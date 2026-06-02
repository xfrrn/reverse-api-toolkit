from fastapi import FastAPI

from services.youdao.api import router as youdao_router


app = FastAPI(
    title="Translation Request Wrapper",
    description="Categorized wrappers for captured translation network requests.",
    version="0.1.0",
)
app.include_router(youdao_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
