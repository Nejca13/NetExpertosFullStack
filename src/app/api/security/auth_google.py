from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from datetime import datetime, timedelta
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt
from typing import Optional

router = APIRouter(prefix="/auth-google", tags=["autenticacion-google"])


# Configuración de las credenciales de Google OAuth 2.0

# Leer las variables de entorno
GOOGLE_CLIENT_ID = load_dotenv(".env")
GOOGLE_CLIENT_SECRET = load_dotenv(".env")
GOOGLE_REDIRECT_URI = "https://vps-4057595-x.dattaweb.com/auth-google/callback"
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URI = "https://www.googleapis.com/oauth2/v2/userinfo"

# Clave secreta para firmar el token
SECRET_KEY = "8b5c2d3f9ba59c5a66e54f7e"
ALGORITHM = "HS256"

# Configuración de MongoDB
client = MongoClient("mongodb://127.0.0.1:27017")
db = client.test
clientes_collection = db.clientes
profesionales_collection = db.profesionales


# Modelos de Pydantic
class User(BaseModel):
    correo: str
    nombre: str = None
    fecha_registro: str = None
    tipo: str = None


def get_user_by_email(email: str):
    user_data = clientes_collection.find_one({"correo": email})
    if not user_data:
        user_data = profesionales_collection.find_one({"correo": email})
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

    existing_user = clientes_collection.find_one({"correo": email})
    if not existing_user:
        user_data = {
            "rol": "Cliente",
            "nombre": user_data.get("given_name"),
            "apellido": user_data.get("family_name"),
            "correo": email,
            "foto_base64": user_data.get("picture"),
            "password": bcrypt.hashpw(
                "Google2024!".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
            "ubicacion": user_data.get("ubicacion"),
            "fecha_registro": datetime.utcnow(),
        }
        new_user_id = clientes_collection.insert_one(user_data).inserted_id
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


@router.post("/login")
def login(user_data: dict):
    existing_profesional = profesionales_collection.find_one(
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
