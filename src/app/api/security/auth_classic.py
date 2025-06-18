from fastapi import APIRouter, Request, Form, HTTPException, Cookie
from fastapi.templating import Jinja2Templates
from pymongo import MongoClient
import bcrypt
from fastapi.responses import HTMLResponse, RedirectResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, List, Annotated
from ..models.cliente import Cliente
from ..models.profesional import Profesional
from ..models.profesion import Profesion
from bson import ObjectId
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/users-form", tags=["autenticacion-clasica"])

Jinja2_templates = Jinja2Templates(directory="templates")


SECRETE_KEY = "8b5c2d3f9ba59c5a66e54f7e"
TOKEN_SECONDS_EXP = 20


client = MongoClient("mongodb://127.0.0.1:27017")
db = client.test
clientes_collection = db.clientes
profesionales_collection = db.profesionales


def create_token(data: dict):
    data_token = data.copy()
    data_token["exp"] = datetime.utcnow() + timedelta(seconds=TOKEN_SECONDS_EXP)
    token_jwt = jwt.encode(data_token, key=SECRETE_KEY, algorithm="HS256")
    return token_jwt


def get_user(correo: str, is_profesional: bool = False):
    collection = profesionales_collection if is_profesional else clientes_collection
    return collection.find_one({"correo": correo})


def authenticate_user(hashed_password: str, password: str):
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


@router.get("/", response_class=HTMLResponse)
def root(request: Request):
    return Jinja2_templates.TemplateResponse("login.html", {"request": request})


@router.post("/login/")
async def login(username: str = Form(...), password: str = Form(...)):
    # Buscar al usuario en la colección de profesionales
    profesional_data = profesionales_collection.find_one({"correo": username})
    if profesional_data:
        # Si el usuario es un profesional, verificar la contraseña
        if not authenticate_user(profesional_data["password"], password):
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        # Generar token JWT
        token = create_token(
            {"username": profesional_data["correo"], "is_profesional": True}
        )
        # Convertir ObjectId a cadena
        profesional_data["_id"] = str(profesional_data["_id"])
        # Convertir fecha_registro a string si existe
        profesional_data["fecha_registro"] = (
            profesional_data.get("fecha_registro", None).strftime("%Y-%m-%d %H:%M:%S")
            if profesional_data.get("fecha_registro")
            else None
        )
        return JSONResponse(content={"token": token, "user_data": profesional_data})

    # Buscar al usuario en la colección de clientes
    cliente_data = clientes_collection.find_one({"correo": username})
    if cliente_data:
        # Si el usuario es un cliente, verificar la contraseña
        if not authenticate_user(cliente_data["password"], password):
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        # Generar token JWT
        token = create_token(
            {"username": cliente_data["correo"], "is_profesional": False}
        )
        # Convertir ObjectId a cadena
        cliente_data["_id"] = str(cliente_data["_id"])
        # Convertir fecha_registro a string si existe
        cliente_data["fecha_registro"] = (
            cliente_data.get("fecha_registro", None).strftime("%Y-%m-%d %H:%M:%S")
            if cliente_data.get("fecha_registro")
            else None
        )
        return JSONResponse(content={"token": token, "user_data": cliente_data})

    # Si el usuario no se encuentra en ninguna colección, devolver un error
    raise HTTPException(
        status_code=401, detail="El usuario no se encuentra en el sistema"
    )


@router.post("/logout/")
def logout():
    return RedirectResponse(
        "/", status_code=302, headers={"set-cookie": "access_token=; Max-Age=0; Path=/"}
    )


@router.get("/dashboard/", response_class=HTMLResponse)
def dashboard(request: Request, access_token: Annotated[str | None, Cookie()] = None):
    if access_token is None:
        return RedirectResponse("/", status_code=302)
    try:
        data_user = jwt.decode(access_token, key=SECRETE_KEY, algorithms=["HS256"])
        is_profesional = "is_profesional" in data_user and data_user["is_profesional"]
        user_data = get_user(data_user["username"], is_profesional)
        if user_data is None:
            return RedirectResponse("/", status_code=302)
        return Jinja2_templates.TemplateResponse(
            "bienvenida.html" if not is_profesional else "bienvenida_profesional.html",
            {"request": request},
        )

    except JWTError:
        return RedirectResponse("/", status_code=302)


# from fastapi import APIRouter, Request, Form, HTTPException, Cookie
# from fastapi.templating import Jinja2Templates
# from pymongo import MongoClient
# import bcrypt
# from fastapi.responses import HTMLResponse, RedirectResponse
# from jose import jwt, JWTError
# from datetime import datetime, timedelta
# from typing import Optional, List, Annotated
# from ..models.cliente import Cliente
# from ..models.profesional import Profesional
# from ..models.profesion import Profesion
# from bson import ObjectId
# from fastapi.responses import JSONResponse
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText
# import smtplib
# import random
# from bson import json_util
# import json

# router = APIRouter(prefix="/users-form", tags=["autenticacion-clasica"])

# Jinja2_templates = Jinja2Templates(directory="templates")


# SECRETE_KEY = "8b5c2d3f9ba59c5a66e54f7e"
# TOKEN_SECONDS_EXP = 20


# client = MongoClient("mongodb://127.0.0.1:27017")
# db = client.test
# clientes_collection = db.clientes
# profesionales_collection = db.profesionales


# # Configuración del servidor SMTP
# smtp_server = 'smtp.gmail.com'
# smtp_port = 587  # Puerto estándar para SMTP con cifrado TLS
# email = 'renzofranchetto91@gmail.com'
# password = 'ddbh nfyj oovx aoqq'


# # Función para enviar el correo electrónico con el OTP
# # Función para enviar el correo electrónico con el OTP y almacenar en la base de datos
# def send_otp_email(username, otp):
#     subject = 'Código de verificación para inicio de sesión'
#     body = f'Su código de verificación es: {otp}'

#     message = MIMEMultipart()
#     message['From'] = email
#     message['To'] = username
#     message['Subject'] = subject
#     message.attach(MIMEText(body, 'plain'))

#     # Iniciar sesión en el servidor SMTP
#     with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
#            # Habilitar cifrado TLS
#         server.login(email, password)  # Iniciar sesión con correo electrónico y contraseña
#         server.sendmail(email, username, message.as_string())  # Enviar correo electrónico

#     # Actualizar la base de datos con el OTP generado y su tiempo de generación
#     current_time = datetime.now()
#     user_data = clientes_collection.find_one({"correo": username})
#     if user_data:
#         clientes_collection.update_one(
#             {"correo": username},
#             {"$set": {"otp_code": otp, "otp_generated_time": current_time}}
#         )
#     else:
#         user_data = profesionales_collection.find_one({"correo": username})
#         if user_data:
#             profesionales_collection.update_one(
#                 {"correo": username},
#                 {"$set": {"otp_code": otp, "otp_generated_time": current_time}}
#             )
#         else:
#             raise HTTPException(status_code=404, detail="Usuario no encontrado")

# # Función para verificar el OTP y su tiempo de expiración
# def verify_otp(username, otp):
#     current_time = datetime.now()
#     user_data = clientes_collection.find_one({"correo": username})
#     if not user_data:
#         user_data = profesionales_collection.find_one({"correo": username})
#         if not user_data:
#             return False, "Usuario no encontrado."

#     stored_otp = user_data.get("otp_code")
#     otp_generated_time = user_data.get("otp_generated_time")

#     if not stored_otp or not otp_generated_time:
#         return False, "No se encontró ningún código OTP generado para este usuario."

#     if current_time - otp_generated_time > timedelta(minutes=10):
#         return False, "El código ha expirado. Por favor, solicite un nuevo código."

#     if otp != stored_otp:
#         return False, "El código ingresado es incorrecto."

#     # Eliminar el OTP de la base de datos después de verificarlo
#     if "clientes" in user_data:
#         clientes_collection.update_one(
#             {"correo": username},
#             {"$unset": {"otp_code": "", "otp_generated_time": ""}}
#         )
#     else:
#         profesionales_collection.update_one(
#             {"correo": username},
#             {"$unset": {"otp_code": "", "otp_generated_time": ""}}
#         )

#     return True, "Inicio de sesión exitoso."


# def create_token(data: dict):
#     data_token = data.copy()
#     data_token["exp"] = datetime.utcnow() + timedelta(seconds=TOKEN_SECONDS_EXP)
#     token_jwt = jwt.encode(data_token, key=SECRETE_KEY, algorithm="HS256")
#     return token_jwt


# def get_user(correo: str, is_profesional: bool = False):
#     collection = profesionales_collection if is_profesional else clientes_collection
#     return collection.find_one({"correo": correo})


# def authenticate_user(hashed_password: str, password: str):
#     return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


# def generate_token():
#     return random.randint(100000, 999999)

# # Endpoint para la autenticación y generación de token
# @router.post("/login1")
# async def login1(username: str = Form(...), password: str = Form(...)):
#     # Verificar las credenciales
#     user_data = clientes_collection.find_one({"correo": username})
#     if not user_data:
#         user_data = profesionales_collection.find_one({"correo": username})
#     if not user_data or not bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
#         raise HTTPException(status_code=401, detail="Credenciales inválidas")

#     # Generar y almacenar el token
#     otp_token = generate_token()
#     clientes_collection.update_one(
#         {"correo": username},
#         {"$set": {"otp_code": otp_token}}
#     )
#     # Enviar el token al correo proporcionado
#     send_otp_email(username, otp_token)

#     return {"message": "Token generado y enviado al correo"}

# # Endpoint para la verificación del token
# @router.post("/login2")
# async def login2(username: str = Form(...), otp: str = Form(...)):
#     user_data = clientes_collection.find_one({"correo": username})
#     if not user_data:
#         user_data = profesionales_collection.find_one({"correo": username})
#     if not user_data:
#         raise HTTPException(status_code=404, detail="Usuario no encontrado")

#     stored_otp = str(user_data.get("otp_code"))  # Convertir a cadena

#     print(stored_otp)
#     if not stored_otp:
#         raise HTTPException(status_code=404, detail="No se encontró ningún código OTP para este usuario")

#     if otp != stored_otp:
#         raise HTTPException(status_code=401, detail="OTP incorrecto")

#     # Eliminar el token de la base de datos después de verificarlo
#     clientes_collection.update_one(
#         {"correo": username},
#         {"$unset": {"otp_code": ""}}
#     )

#     # Excluir el campo _id antes de devolver el objeto
#     user_data["_id"] = str(user_data["_id"])

#     fecha_registro = user_data.get("fecha_registro")

#     # Convierte la fecha de registro a una cadena en formato ISO 8601 si existe
#     if fecha_registro:
#         fecha_registro_str = fecha_registro.strftime("%Y-%m-%d %H:%M:%S")
#         user_data['fecha_registro'] = fecha_registro_str
#     else:
#         user_data['fecha_registro'] = None

#     token = create_token({"username": user_data["correo"], "is_profesional": False})

#     # Serializa los datos del usuario a JSON
#     serialized_user_data = json.dumps(user_data, default=str)

#     return JSONResponse(content={"token": token, "user_data": serialized_user_data})

# @router.post("/logout/")
# def logout():
#     return RedirectResponse(
#         "/", status_code=302,
#         headers={"set-cookie": "access_token=; Max-Age=0; Path=/"}
#      )
