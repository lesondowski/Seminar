from pydantic import BaseModel
from fastapi import APIRouter

from app.services.chat_service import answer_chat

router = APIRouter(prefix='/chat', tags=['chat'])


class ChatRequest(BaseModel):
    message: str
    context: dict | None = None


@router.post('')
def chat(payload: ChatRequest):
    response = answer_chat(payload.message, payload.context)
    return {'response': response}
