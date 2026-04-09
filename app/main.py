from fastapi import FastAPI
from app.routes import router

app = FastAPI(
    title="AI Document Summarizer + Assistant",
    version="2.0"
)

app.include_router(router)
