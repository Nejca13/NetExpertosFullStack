from fastapi import APIRouter, Request, Form, HTTPException, Cookie
from fastapi.templating import Jinja2Templates
import bcrypt
from fastapi.responses import HTMLResponse, RedirectResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Annotated

from app.api.core import CLIENTES_COLLECTION, PROFESIONALES_COLLECTION
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/users-form", tags=["autenticacion-clasica"])

Jinja2_templates = Jinja2Templates(directory="templates")


SECRETE_KEY = "8b5c2d3f9ba59c5a66e54f7e"
TOKEN_SECONDS_EXP = 20


def create_token(data: dict):
    data_token = data.copy()
    data_token["exp"] = datetime.utcnow() + timedelta(seconds=TOKEN_SECONDS_EXP)
    token_jwt = jwt.encode(data_token, key=SECRETE_KEY, algorithm="HS256")
    return token_jwt


def get_user(correo: str, is_profesional: bool = False):
    collection = PROFESIONALES_COLLECTION if is_profesional else CLIENTES_COLLECTION
    return collection.find_one({"correo": correo})


def authenticate_user(hashed_password: str, password: str):
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


@router.get("/", response_class=HTMLResponse)
def root(request: Request):
    return Jinja2_templates.TemplateResponse("login.html", {"request": request})


@router.post("/login/")
async def login(username: str = Form(...), password: str = Form(...)):
    # Buscar al usuario en la colección de profesionales
    profesional_data = PROFESIONALES_COLLECTION.find_one({"correo": username})
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
    cliente_data = CLIENTES_COLLECTION.find_one({"correo": username})
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
