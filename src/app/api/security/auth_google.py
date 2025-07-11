from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt
from typing import Optional
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from fastapi import Response

from app.api.core import CLIENTES_COLLECTION, PROFESIONALES_COLLECTION

router = APIRouter(prefix="/auth-google", tags=["autenticacion-google"])


# Configuración de las credenciales de Google OAuth 2.0

# Leer las variables de entorno
GOOGLE_CLIENT_ID = load_dotenv(".env")
GOOGLE_CLIENT_SECRET = load_dotenv(".env")
GOOGLE_REDIRECT_URI = "https://vps-4622713-x.dattaweb.com/api/auth-google/callback/"
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URI = "https://www.googleapis.com/oauth2/v2/userinfo"

# Clave secreta para firmar el token
SECRET_KEY = "8b5c2d3f9ba59c5a66e54f7e"
ALGORITHM = "HS256"


# Modelos de Pydantic
class User(BaseModel):
    correo: str
    nombre: str = None
    fecha_registro: str = None
    tipo: str = None


def get_user_by_email(email: str):
    user_data = CLIENTES_COLLECTION.find_one({"correo": email})
    if not user_data:
        user_data = PROFESIONALES_COLLECTION.find_one({"correo": email})
    return user_data


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=240)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"email": email}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def create_user_response(user_data):
    user_data["_id"] = str(user_data["_id"])
    if "fecha_registro" in user_data and isinstance(
        user_data["fecha_registro"], datetime
    ):
        user_data["fecha_registro"] = user_data["fecha_registro"].strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    return user_data


def get_or_create_user(user_data):
    email = user_data.get("email")
    if not email:
        raise HTTPException(
            status_code=400,
            detail="No se pudo obtener el correo electrónico del usuario",
        )

    existing_user = CLIENTES_COLLECTION.find_one({"correo": email})
    if not existing_user:
        user_data = {
            "rol": "Cliente",
            "nombre": user_data.get("given_name"),
            "apellido": user_data.get("family_name"),
            "correo": email,
            "foto_perfil": user_data.get("picture"),
            "password": bcrypt.hashpw(
                "Google2024!".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
            "ubicacion": user_data.get("ubicacion"),
            "fecha_registro": datetime.utcnow(),
        }
        new_user_id = CLIENTES_COLLECTION.insert_one(user_data).inserted_id
        user_data["_id"] = str(new_user_id)
        token = create_access_token(data={"user_id": str(new_user_id), "email": email})
        return {
            "message": "Cliente creado con éxito",
            "token": token,
            "user_data": user_data,
        }
    else:
        existing_user["_id"] = str(existing_user["_id"])
        if "fecha_registro" in existing_user:
            existing_user["fecha_registro"] = (
                existing_user["fecha_registro"].strftime("%Y-%m-%d %H:%M:%S")
                if existing_user["fecha_registro"]
                else None
            )
        token = create_access_token(
            data={"user_id": existing_user["_id"], "email": email}
        )
        user_data = existing_user.copy()
        return {
            "message": "Inicio de sesión exitoso",
            "token": token,
            "user_data": user_data,
        }


@router.post("/login/")
def login(user_data: dict):
    existing_profesional = PROFESIONALES_COLLECTION.find_one(
        {"correo": user_data.get("email")}
    )
    if existing_profesional:
        existing_profesional["_id"] = str(existing_profesional["_id"])
        if "fecha_registro" in existing_profesional:
            existing_profesional["fecha_registro"] = (
                existing_profesional["fecha_registro"].strftime("%Y-%m-%d %H:%M:%S")
                if existing_profesional["fecha_registro"]
                else None
            )
        token = create_access_token(
            data={
                "user_id": existing_profesional["_id"],
                "email": existing_profesional["correo"],
            }
        )
        user_data = existing_profesional.copy()
        return {
            "message": "Inicio de sesión exitoso",
            "token": token,
            "user_data": user_data,
        }
    else:
        try:
            user = get_or_create_user(user_data)
            return user
        except HTTPException as e:
            return {"message": "Error al iniciar sesión", "detail": str(e)}


def create_user_response(user_data):
    user_data["_id"] = str(user_data["_id"])
    if "fecha_registro" in user_data:
        user_data["fecha_registro"] = (
            user_data["fecha_registro"].strftime("%Y-%m-%d %H:%M:%S")
            if user_data["fecha_registro"]
            else None
        )
    return user_data


@router.post("/google-auth-v2/login/")
async def google_login_v2(payload: dict, response: Response):
    try:
        id_token_str = payload.get("token")
        if not id_token_str:
            raise HTTPException(status_code=400, detail="Token no proporcionado")

        # Verifica el token con el CLIENT_ID tipo Web
        id_info = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            "714395374113-539b12soro38d2srslfjgt07l04m8j4a.apps.googleusercontent.com",
        )

        email = id_info.get("email")
        if not email:
            raise HTTPException(
                status_code=400, detail="Email no encontrado en el token"
            )

        # Buscar en clientes o profesionales
        profesional = PROFESIONALES_COLLECTION.find_one({"correo": email})
        if profesional:
            profesional["_id"] = str(profesional["_id"])
            profesional["fecha_registro"] = (
                profesional["fecha_registro"].strftime("%Y-%m-%d %H:%M:%S")
                if profesional.get("fecha_registro")
                else None
            )
            token = create_access_token(
                data={"user_id": profesional["_id"], "email": email}
            )
            return {"success": True, "user": profesional, "token": token}

        # Cliente nuevo o existente
        cliente = CLIENTES_COLLECTION.find_one({"correo": email})
        if not cliente:
            cliente_data = {
                "rol": "Cliente",
                "nombre": id_info.get("given_name"),
                "apellido": id_info.get("family_name"),
                "correo": email,
                "foto_perfil": id_info.get("picture"),
                "password": bcrypt.hashpw(
                    "Google2024!".encode(), bcrypt.gensalt()
                ).decode(),
                "ubicacion": None,
                "fecha_registro": datetime.utcnow(),
            }
            inserted_id = CLIENTES_COLLECTION.insert_one(cliente_data).inserted_id
            cliente_data["_id"] = str(inserted_id)
            token = create_access_token(
                data={"user_id": str(inserted_id), "email": email}
            )
            return {
                "success": False,
                "message": "Cliente creado, debe completar el registro",
                "temp_user": cliente_data,
                "token": token,
            }
        else:
            cliente["_id"] = str(cliente["_id"])
            cliente["fecha_registro"] = (
                cliente["fecha_registro"].strftime("%Y-%m-%d %H:%M:%S")
                if cliente.get("fecha_registro")
                else None
            )
            token = create_access_token(
                data={"user_id": cliente["_id"], "email": email}
            )
            return {"success": True, "user": cliente, "token": token}

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")
