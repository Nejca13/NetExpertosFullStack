from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, APIRouter, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/chat", tags=["chat"])

# Conexión a la base de datos
client = MongoClient("mongodb://127.0.0.1:27017")
db = client.chat
conversations_collection = db.conversations
clients_collection = db.clientes  

connected_users: Dict[str, WebSocket] = {}

@router.websocket("/ws/{user_id}/{role}")
async def websocket_endpoint(user_id: str, role: str, websocket: WebSocket):
    await websocket.accept()
    connected_users[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            await process_message(user_id, role, data)
    except WebSocketDisconnect:
        del connected_users[user_id]

async def process_message(sender_id: str, role: str, data: str):
    parts = data.split(":", 4)
    receiver_id = parts[0]
    message = parts[1]
    image = parts[2] if len(parts) > 2 else ""
    sender_name = parts[3] if len(parts) > 3 else ""
    sender_surname = parts[4] if len(parts) > 4 else ""

    try:
        store_message(sender_id, receiver_id, message, image, sender_name, sender_surname, role)
    except HTTPException as e:
        if sender_id in connected_users:
            sender_ws = connected_users[sender_id]
            await sender_ws.send_text(f"Error: {e.detail}")

    if receiver_id in connected_users:
        receiver_ws = connected_users[receiver_id]
        message_data = {
            "id": sender_id,
            "message": message,
            "image": image,
            "name": sender_name,
            "surname": sender_surname,
            "role": role
        }
        await receiver_ws.send_json(message_data)

def store_message(sender_id: str, receiver_id: str, message: str, image: str, sender_name: str, sender_surname: str, role: str):
    message_data = {
        "remitente_id": sender_id,
        "mensaje": message,
        "imagen": image,
        "nombre": sender_name,
        "apellido": sender_surname,
        "rol": role,
        "time": datetime.utcnow()
    }

    current_date = datetime.utcnow().strftime('%Y-%m-%d')
    conversation_id = f"{sender_id}_{receiver_id}_{current_date}" if sender_id < receiver_id else f"{receiver_id}_{sender_id}_{current_date}"

    conversations_collection.update_one(
        {"_id": conversation_id, "date": current_date},
        {
            "$setOnInsert": {"participantes": [sender_id, receiver_id], "date": current_date},
            "$push": {"mensajes": message_data}
        },
        upsert=True
    )

@router.get("/conversaciones/{user_id}")
async def get_conversations(user_id: str, date: Optional[str] = Query(None, regex=r"^\d{4}-\d{2}-\d{2}$")):
    query = {"participantes": user_id}
    if date:
        query["date"] = date
    conversations = conversations_collection.find(query)
    return {"conversaciones": list(conversations)}

@router.get("/conversaciones/{user1_id}/{user2_id}")
async def get_conversation_between_users(user1_id: str, user2_id: str, date: Optional[str] = Query(None, regex=r"^\d{4}-\d{2}-\d{2}$")):
    query = {"participantes": {"$all": [user1_id, user2_id]}}
    if date:
        query["_id"] = f"{user1_id}_{user2_id}_{date}" if user1_id < user2_id else f"{user2_id}_{user1_id}_{date}"
    conversations = conversations_collection.find(query)
    return {"conversaciones": list(conversations)}

@router.get("/ultimo-mensaje/{user_id}")
async def get_last_messages(user_id: str):
    conversations = conversations_collection.find({"participantes": user_id})
    last_messages = []
    
    for conversation in conversations:
        last_sender_message = None
        last_receiver_message = None
        for message in reversed(conversation['mensajes']):
            if message['remitente_id'] == user_id and last_sender_message is None:
                last_sender_message = message
            elif message['remitente_id'] != user_id and last_receiver_message is None:
                last_receiver_message = message
            if last_sender_message and last_receiver_message:
                break
        
        other_participant = [p for p in conversation['participantes'] if p != user_id][0]
        last_messages.append({
            "conversacion_id": conversation['_id'],
            "otro_participante": other_participant,
            "ultimo_mensaje_remitente": last_sender_message,
            "ultimo_mensaje_destinatario": last_receiver_message
        })
    
    return {"ultimos_mensajes": last_messages}
