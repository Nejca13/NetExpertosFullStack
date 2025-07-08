# utils/notifications.py

from datetime import datetime
from firebase_admin import messaging
from fastapi import HTTPException
from pydantic import BaseModel, Field
from app.api.core import FMC_TOKENS_COLLECTION, NOTIFICACIONES_COLLECTION
from typing import Dict, Optional


class NotificationIn(BaseModel):
    title: str
    body: str
    user_id: Optional[str] = Field(None, alias="userId")
    type: Optional[str]
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


async def enviar_notificacion_a_usuario(data: NotificationIn, user_id: str) -> Dict:
    print(
        f"[LOG] Enviando notificación a user_id={user_id} con datos: {data.dict(by_alias=True)}"
    )

    tokens = list(
        FMC_TOKENS_COLLECTION.find({"userId": user_id}, {"_id": 0, "token": 1})
    )
    print(f"[LOG] Tokens encontrados para usuario {user_id}: {tokens}")

    if not tokens:
        print(f"[WARN] No hay tokens registrados para el usuario {user_id}")
        raise HTTPException(
            status_code=404, detail="El usuario no tiene tokens registrados"
        )

    result_insert = NOTIFICACIONES_COLLECTION.insert_one(data.dict(by_alias=True))
    print(f"[LOG] Notificación guardada con ID: {result_insert.inserted_id}")

    success = 0
    failure = 0

    for entry in tokens:
        token = entry["token"]
        print(f"[LOG] Enviando notificación al token: {token}")
        msg = messaging.Message(
            notification=messaging.Notification(title=data.title, body=data.body),
            token=token,
        )
        try:
            response = messaging.send(msg)
            print(f"[LOG] Mensaje enviado correctamente: {response}")
            success += 1
        except Exception as e:
            print(f"[ERROR] Error enviando a token {token}: {e}")
            delete_result = FMC_TOKENS_COLLECTION.delete_one({"token": token})
            print(f"[LOG] Token eliminado: {delete_result.deleted_count} documento(s)")
            failure += 1

    print(f"[LOG] Resumen: Enviadas={success}, Fallidas={failure}")
    return {"sent": success, "failed": failure}
