from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from typing import List


class ConversationModel(BaseModel):
    participants: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MessageModel(BaseModel):
    conversation_id: str  # mismo tipo que _id de Conversation
    sender_id: str
    message: str
    image: str = ""
    sender_name: str
    sender_surname: str
    role: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ConversationResponse(BaseModel):
    id: str = Field(alias="_id")
    participants: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class MessageResponse(BaseModel):
    id: str = Field(alias="_id")
    conversation_id: str
    sender_id: str
    message: str
    image: str = ""
    sender_name: str
    sender_surname: str
    role: str
    timestamp: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
