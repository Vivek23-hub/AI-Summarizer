from fastapi import APIRouter, UploadFile, File
from app.schemas import TextRequest, QuestionRequest
from app.model import model_instance
from app.utils import clean_text
from app.file_handlers import extract_text
from app.qa_model import answer_question

router = APIRouter()

@router.post("/summarize-text")
async def summarize_text(data: TextRequest):
    cleaned = clean_text(data.text)

    summary = model_instance.summarize(
        cleaned,
        mode=data.mode
    )

    return {"summary": summary}


@router.post("/summarize-file")
async def summarize_file(file: UploadFile = File(...), mode: str = "balanced"):
    text = extract_text(file.file, file.filename)
    cleaned = clean_text(text)

    summary = model_instance.summarize(
        cleaned,
        mode=mode
    )

    return {"summary": summary}


@router.post("/ask")
async def ask_question_api(data: QuestionRequest):
    answer = answer_question(data.context, data.question)
    return {"answer": answer}
