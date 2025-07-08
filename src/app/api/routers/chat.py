from hmac import new
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
from app.api.utils.notifications import NotificationIn, enviar_notificacion_a_usuario

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
    receiver_id = data["receiver_id"]
    message = data["message"]
    image = data.get("image", "")
    sender_name = data.get("sender_name")
    sender_surname = data.get("sender_surname")

    # 1) Normalizamos participantes
    participants = sorted([sender_id, receiver_id])

    # 2) Buscar conversación
    conversation = CONVERSATIONS_COLLECTION.find_one(
        {"participants": {"$eq": participants}}
    )

    if not conversation:
        conversation = CONVERSATIONS_COLLECTION.find_one(
            {"participants": {"$eq": sorted([receiver_id, sender_id])}}
        )

    # 3) Crear o actualizar conversación
    if not conversation:
        convo_data = {
            "participants": participants,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = CONVERSATIONS_COLLECTION.insert_one(convo_data)
        conversation_id = str(result.inserted_id)
    else:
        CONVERSATIONS_COLLECTION.update_one(
            {"_id": conversation["_id"]}, {"$set": {"updated_at": datetime.utcnow()}}
        )
        conversation_id = str(conversation["_id"])

    ts = datetime.utcnow()

    # 4) Insertar mensaje
    msg_doc = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "message": message,
        "image": image,
        "sender_name": sender_name,
        "sender_surname": sender_surname,
        "role": role,
        "timestamp": ts,
    }
    new_msg = MESSAGES_COLLECTION.insert_one(msg_doc)
    msg_id = str(new_msg.inserted_id)

    # 5) Payload para WebSocket
    payload = {
        **msg_doc,
        "_id": msg_id,
        "timestamp": ts.isoformat(),
    }

    ws = connected_users.get(receiver_id)
    if ws:
        await ws.send_json(payload)

    # 6) Enviar push si el receptor no está conectado
    if not ws:
        try:
            noti = NotificationIn(
                title=f"{sender_name or ''} {sender_surname or ''}".strip(),
                body=message,
                type="chat",
                user_id=receiver_id,
                conversation_id=conversation_id,
                image_url=image,
            )
            await enviar_notificacion_a_usuario(noti, receiver_id)
            print(f"[LOG] Push enviada a user {receiver_id}")
        except Exception as e:
            print(f"[ERROR] Falló el envío de push: {e}")


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
    "/conversaciones/chatroom/{conversacion_id}/",
)
async def get_conversation_messages(
    conversacion_id: str, page: int = 1, limit: int = 80
):
    # Buscamos la conversación
    conversation = CONVERSATIONS_COLLECTION.find_one({"_id": ObjectId(conversacion_id)})
    print(f"Conversación encontrada: {conversation}")
    if not conversation:
        return {"mensajes": []}

    convo_id = conversation["_id"]
    print(f"Convo ID: {convo_id}")
    skip = (page - 1) * limit

    # Obtener mensajes más recientes primero
    mensajes = (
        MESSAGES_COLLECTION.find({"conversation_id": str(convo_id)})
        .sort("timestamp", -1)
        .to_list()
    )

    print(f"Mensajes encontrados: {len(mensajes)}")

    for msg in mensajes:
        msg["_id"] = str(msg["_id"])

    mensajes.reverse()  # Invertimos el orden para mostrar los más antiguos primero

    mensajes_response = [MessageResponse(**msg) for msg in mensajes]
    return {"mensajes": mensajes_response}


@router.get("/ultimo-mensaje/{user_id}/")
async def get_last_messages(user_id: str):
    convs = list(
        CONVERSATIONS_COLLECTION.find(
            {
                "participants": user_id,
                "participants.1": {"$exists": True},  # hay al menos 2
                "participants.2": {"$exists": False},  # NO hay más de 2
            }
        ).sort("updated_at", -1)
    )

    conv_ids = [str(conv["_id"]) for conv in convs]
    conv_map = {str(conv["_id"]): conv for conv in convs}

    if not conv_ids:
        return {"ultimos_mensajes": []}

    pipeline = [
        {"$match": {"conversation_id": {"$in": conv_ids}}},
        {"$sort": {"timestamp": -1}},
        {"$group": {"_id": "$conversation_id", "last_msg": {"$first": "$$ROOT"}}},
    ]
    agg = list(MESSAGES_COLLECTION.aggregate(pipeline))

    last_messages = []
    for entry in agg:
        msg = entry["last_msg"]
        conv = conv_map[entry["_id"]]

        # OBTENGO el otro participante sin next()
        p0, p1 = conv["participants"]
        other_id = p0 if p1 == user_id else p1

        other_user = CLIENTES_COLLECTION.find_one(
            {"_id": ObjectId(other_id)}
        ) or PROFESIONALES_COLLECTION.find_one({"_id": ObjectId(other_id)})

        last_messages.append(
            {
                "conversacion_id": entry["_id"],
                "otro_participante": other_id,
                "nombre": other_user.get("nombre", "") if other_user else "",
                "apellido": other_user.get("apellido", "") if other_user else "",
                "foto_perfil": other_user.get("foto_perfil") if other_user else None,
                "ultimo_mensaje": MessageResponse(**{**msg, "_id": str(msg["_id"])}),
            }
        )

    return {"ultimos_mensajes": last_messages}


@router.get("/last-message/between-two-users/{user1_id}/{user2_id}/")
async def get_last_message_between_two_users(user1_id: str, user2_id: str):
    # Buscar conversación exacta entre esos dos usuarios
    conversation = CONVERSATIONS_COLLECTION.find_one(
        {"participants": [user1_id, user2_id]},
        sort=[("updated_at", -1)],
    )

    if not conversation:
        # si querés intentar el orden inverso (aunque $all no lo necesita)
        conversation = CONVERSATIONS_COLLECTION.find_one(
            {"participants": [user2_id, user1_id]},
            sort=[("updated_at", -1)],
        )

    if not conversation:
        return {"success": False, "error": "No se encontraron conversaciones"}

    convo_id = str(conversation["_id"])

    # Buscar el último mensaje en esa conversación
    msg = MESSAGES_COLLECTION.find_one(
        {"conversation_id": convo_id},
        sort=[("timestamp", -1)],
    )

    if not msg:
        return {"ultimo_mensaje": None}

    p0, p1 = conversation["participants"]
    other_id = p0 if p1 == user1_id else p1

    other_user = CLIENTES_COLLECTION.find_one(
        {"_id": ObjectId(other_id)}
    ) or PROFESIONALES_COLLECTION.find_one({"_id": ObjectId(other_id)})
    if msg is None:
        return {"success": False, "error": "No se encontraron mensajes"}
    return {
        "success": True,
        "conversacion_id": convo_id,
        "otro_participante": other_id,
        "nombre": other_user.get("nombre", "") if other_user else "",
        "apellido": other_user.get("apellido", "") if other_user else "",
        "foto_perfil": other_user.get("foto_perfil") if other_user else None,
        "ultimo_mensaje": MessageResponse(**{**msg, "_id": str(msg["_id"])}),
    }
