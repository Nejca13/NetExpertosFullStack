from bson import ObjectId
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
from datetime import datetime

from app.api.core import (
    CLIENTES_COLLECTION,
    CONVERSATIONS_COLLECTION,
    MESSAGES_COLLECTION,
    PROFESIONALES_COLLECTION,
)
from app.api.models.conversation import ConversationResponse, MessageResponse

router = APIRouter(prefix="/chat", tags=["chat"])

connected_users: Dict[str, WebSocket] = {}


@router.websocket("/ws/{user_id}/{role}/")
async def websocket_endpoint(user_id: str, role: str, websocket: WebSocket):
    await websocket.accept()
    connected_users[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_json()
            await process_message(user_id, role, data)
    except WebSocketDisconnect:
        connected_users.pop(user_id, None)


async def process_message(sender_id: str, role: str, data: dict):
    receiver_id = data.get("receiver_id")
    message = data.get("message")
    image = data.get("image", "")
    sender_name = data.get("sender_name")
    sender_surname = data.get("sender_surname")

    # Buscar conversación existente entre sender y receiver (solo 2 participantes)
    conversation = CONVERSATIONS_COLLECTION.find_one(
        {
            "participants": {"$all": [sender_id, receiver_id]},
            "participants": {"$size": 2},
        }
    )

    if not conversation:
        convo_data = {
            "participants": [sender_id, receiver_id],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = CONVERSATIONS_COLLECTION.insert_one(convo_data)
        conversation_id = str(result.inserted_id)
    else:
        conversation_id = str(conversation["_id"])
        CONVERSATIONS_COLLECTION.update_one(
            {"_id": conversation["_id"]}, {"$set": {"updated_at": datetime.utcnow()}}
        )

    # Insertar mensaje
    msg_doc = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "message": message,
        "image": image,
        "sender_name": sender_name,
        "sender_surname": sender_surname,
        "role": role,
        "timestamp": datetime.utcnow(),
    }
    MESSAGES_COLLECTION.insert_one(msg_doc)

    # Enviar al receptor si está conectado
    if receiver_id in connected_users:
        await connected_users[receiver_id].send_json(
            {
                "id": sender_id,
                "message": message,
                "image": image,
                "name": sender_name,
                "surname": sender_surname,
                "role": role,
            }
        )


@router.get("/conversaciones/{user_id}/")
async def get_conversations(user_id: str):
    conversations = list(
        CONVERSATIONS_COLLECTION.find(
            {"participants": {"$in": [user_id]}, "participants": {"$size": 2}}
        )
    )
    conversations_response = [ConversationResponse(**conv) for conv in conversations]
    return {"conversaciones": conversations_response}


@router.get(
    "/conversaciones/{user1_id}/{user2_id}/",
)
async def get_conversation_messages(user1_id: str, user2_id: str):
    conversation = CONVERSATIONS_COLLECTION.find_one(
        {"participants": {"$all": [user1_id, user2_id]}, "participants": {"$size": 2}}
    )

    if not conversation:
        return {"mensajes": []}

    conversation_id = str(conversation["_id"])

    messages = list(
        MESSAGES_COLLECTION.find({"conversation_id": conversation_id}).sort(
            "timestamp", 1
        )
    )
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    messages_response = [MessageResponse(**msg) for msg in messages]
    return {"mensajes": messages_response}


@router.get("/ultimo-mensaje/{user_id}/")
async def get_last_messages(user_id: str):
    cursor = CONVERSATIONS_COLLECTION.find({"participants": {"$in": [user_id]}})
    conversations = list(cursor)

    last_messages = []

    for conversation in conversations:
        convo_id = str(conversation["_id"])
        msg_cursor = (
            MESSAGES_COLLECTION.find({"conversation_id": convo_id})
            .sort("timestamp", -1)
            .limit(1)
        )
        last_msg = next(msg_cursor, None)

        if last_msg:
            participantes = conversation["participants"]
            other = next((p for p in participantes if p != user_id), None)

            # Buscar info del otro participante
            other_user = CLIENTES_COLLECTION.find_one(
                {"_id": ObjectId(other)}
            ) or PROFESIONALES_COLLECTION.find_one({"_id": ObjectId(other)})

            other_image = other_user.get("foto_perfil") if other_user else None
            other_name = other_user.get("nombre", "") if other_user else ""
            other_surname = other_user.get("apellido", "") if other_user else ""

            last_messages.append(
                {
                    "conversacion_id": convo_id,
                    "otro_participante": other,
                    "nombre": other_name,
                    "apellido": other_surname,
                    "foto_perfil": other_image,
                    "ultimo_mensaje": MessageResponse(
                        **{**last_msg, "_id": str(last_msg["_id"])}
                    ),
                }
            )

    return {"ultimos_mensajes": last_messages}
