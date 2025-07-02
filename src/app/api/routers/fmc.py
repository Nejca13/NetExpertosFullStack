# Modelos Pydantic
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.api.core import FMC_TOKENS_COLLECTION, NOTIFICACIONES_COLLECTION
import firebase_admin
from firebase_admin import messaging, credentials

# Inicializar Firebase Admin
cred = credentials.Certificate("src/app/api/keys/netexpertos-firebase.json")
firebase_admin.initialize_app(cred)

router = APIRouter(prefix="/fcm", tags=["FCM"])


token_oauth2 = None  # Placeholder si usan auth


class FcmTokenIn(BaseModel):
    token: str
    userId: Optional[str] = None


class NotificationIn(BaseModel):
    title: str
    body: str
    user_id: Optional[str] = Field(None, alias="userId")
    type: Optional[str]
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


@router.post("/register-token/")
async def register_token(data: FcmTokenIn):
    if not data.token:
        raise HTTPException(status_code=400, detail="El token es obligatorio")

    query = {"token": data.token}
    update = {"$set": {"token": data.token, "userId": data.userId}}
    result = FMC_TOKENS_COLLECTION.update_one(query, update, upsert=True)

    if result.upserted_id:
        return {"message": "Token registrado exitosamente"}
    return {"message": "Token actualizado exitosamente"}


@router.post("/send-notification/")
async def send_notification(data: NotificationIn):
    # Debug: mostrar datos recibidos
    print(f"[DEBUG] send_notification called with data: {data.dict(by_alias=True)}")

    # Obtener tokens
    cursor = FMC_TOKENS_COLLECTION.find({}, {"_id": 0, "token": 1})
    tokens = await cursor.to_list(length=None)
    print(f"[DEBUG] Tokens encontrados en la base de datos: {tokens}")
    if not tokens:
        print("[DEBUG] No hay tokens registrados, abortando")
        raise HTTPException(status_code=400, detail="No hay tokens registrados")

    # Guardar notificación
    result_insert = NOTIFICACIONES_COLLECTION.insert_one(data.dict(by_alias=True))
    print(f"[DEBUG] Notificación insertada con ID: {result_insert.inserted_id}")

    success = 0
    failure = 0
    # Iterar sobre tokens y enviar mensajes
    for entry in tokens:
        token = entry.get("token")
        print(f"[DEBUG] Enviando notificación a token: {token}")
        msg = messaging.Message(
            notification=messaging.Notification(title=data.title, body=data.body),
            token=token,
        )
        try:
            response = messaging.send(msg)
            print(f"[DEBUG] Mensaje enviado correctamente, response: {response}")
            success += 1
        except Exception as e:
            print(f"[ERROR] Error enviando a {token}: {e}")
            delete_result = FMC_TOKENS_COLLECTION.delete_one({"token": token})
            print(
                f"[DEBUG] Token eliminado: {delete_result.deleted_count} documento(s)"
            )
            failure += 1

    summary = {"sent": success, "failed": failure}
    print(f"[DEBUG] Resumen: {summary}")
    return {"message": f"Enviadas: {success}, fallidas: {failure}"}


@router.get("/get-notifications/")
async def get_notifications(page: int = 1, limit: int = 5):
    skip = (page - 1) * limit
    query = {"type": {"$nin": ["MEMBERSHIP_REQUEST", "MEMBERSHIP_APPROVED"]}}
    cursor = NOTIFICACIONES_COLLECTION.find(query)
    total = cursor.count()
    docs = cursor.sort("-created_at").skip(skip).limit(limit).to_list(length=limit)

    return {
        "notifications": docs,
        "total": total,
        "page": page,
        "limit": limit,
    }


""" @router.post("/request-membership/")
async def request_membership(user_id: str):
    user = User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Comprobar si ya es miembro
    member = Member.find_one(Member.user_id == PydanticObjectId(user_id))
    if member:
        raise HTTPException(
            status_code=400, detail="Ya eres miembro, intenta recargar la App."
        )

    # Comprobar si ya hizo una solicitud hoy
    hoy = datetime.utcnow().date()
    inicio_dia = datetime.combine(hoy, datetime.min.time())
    fin_dia = datetime.combine(hoy + timedelta(days=1), datetime.min.time())

    ya_solicitada = Notification.find(
        {
            "user_id": str(user.id),
            "created_at": {"$gte": inicio_dia, "$lt": fin_dia},
        }
    ).count()

    if ya_solicitada:
        raise HTTPException(status_code=400, detail="Ya hiciste una solicitud hoy")

    print("Hoy:", hoy)
    print("Inicio:", inicio_dia.isoformat())
    print("Fin:", fin_dia.isoformat())

    title = "Nueva solicitud de membresía"
    body = f"El usuario {user.email} ha solicitado una membresía."

    notification = Notification(
        title=title,
        body=body,
        user_id=str(user.id),
        type=NotificationType.MEMBERSHIP_REQUEST,
    )
    notification.insert()

    admin_users = User.find(
        {"rol": {"$in": [Role.SUPER_ADMIN, Role.ADMIN]}}
    ).to_list()
    admin_ids = [str(admin.id) for admin in admin_users]

    token = "cHOcupswROC9rm2AmY_fHn:APA91bGThHuMvBhFsMjqbJuZFTQcVWj-W94I1LaSqJ0kPUSPdBYa0ZjgFqlGsQ3TV9O0eeaUxWbr58zjqPd6cXUIXbnQQmcdZfTiCtBIfVyDrIq6xRLGrM8"
    tokens = FcmToken.find({"userId": {"$in": admin_ids}}).to_list()

    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=token,
        )
        messaging.send(message)
    except Exception as e:
        print(f"Error enviando a {token}: {str(e)}")

    return {"message": "Solicitud enviada exitosamente"}

    if not tokens:
        raise HTTPException(
            status_code=404,
            detail="No hay ningun administrador disponible, intenta mas tarde",
        )

    success = 0
    for token in tokens:
        try:
            message = messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                token=token.token,
            )
            messaging.send(message)
            success += 1
        except Exception as e:
            print(f"Error enviando a {token.token}: {str(e)}")
            token.delete()

    return {"message": f"Solicitud enviada a {success} administradores"}


@router.get("/membership-requests/")
async def list_membership_requests():
    notificaciones = (
        Notification.find({"title": "Nueva solicitud de membresía"})
        .sort("-created_at")
        .to_list()
    )

    user_ids = list({n.user_id for n in notificaciones if n.user_id})
    usuarios = User.find(
        {"_id": {"$in": [PydanticObjectId(uid) for uid in user_ids]}}
    ).to_list()
    usuarios_map = {str(u.id): u for u in usuarios}

    result = []
    for n in notificaciones:
        result.append(
            {
                "id": str(n.id),
                "title": n.title,
                "body": n.body,
                "created_at": n.created_at,
                "user": usuarios_map.get(n.user_id),
            }
        )

    return result """
