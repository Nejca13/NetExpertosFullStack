from fastapi import APIRouter, HTTPException, Form
from pymongo import MongoClient
import bcrypt
from datetime import datetime, timedelta
from ..models.cliente import Cliente
from bson import ObjectId
import re
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from typing import List, Dict, Optional
from ..models.foto import Foto
from ..models.profesional import Profesional
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError


# Conexión a la base de datos
client = MongoClient("mongodb://127.0.0.1:27017")
db = client.test
clientes_collection = db.clientes
profesionales_collection = db.profesionales
temp_clientes_collection = (
    db.temp_clientes
)  # Colección temporal para almacenar clientes antes de verificar OTP
profesiones_collection = db.profesiones


# Configuración del servidor SMTP
smtp_server = "smtp.gmail.com"
smtp_port = 587  # Puerto estándar para SMTP con cifrado TLS
email = "desarrollo.nca@gmail.com"
password = "jitr phsl sjkl aass"

router = APIRouter(
    prefix="/clientes", tags=["clientes"], responses={404: {"message": "No encontrado"}}
)

SECRETE_KEY = "8b5c2d3f9ba59c5a66e54f7e"
TOKEN_SECONDS_EXP = 20
PASSWORD_REGEX = (
    "^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$"
)
LOCATION_REGEX = r"^(-?([1-8]?\d(\.\d+)?|90(\.0+)?)),\s*(-?((1[0-7]\d(\.\d+)?|1[0-8]0(\.0+)?|\d{1,2}(\.\d+)?)))$"
NUMERO_REGEX = (
    r"^\+?([0-9]{2})?[-. ]?(\(?[0-9]{2}\)?[-. ]?)?([0-9]{4})[-. ]?([0-9]{4})$"
)


class DatosProfesional(BaseModel):
    rol: str = "Profesional"
    nombre: str = Field(..., description="Nombre del profesional")
    apellido: str = Field(..., description="Apellido del profesional")
    numero: str = Field(..., description="Número de teléfono del profesional")
    correo: str = Field(..., description="Correo electrónico del profesional")
    ubicacion: str = Field(..., description="Ubicación del profesional")
    calificacion: float = 0.0
    experiencia_laboral_años: int = Field(
        ..., description="Experiencia laboral en años del profesional"
    )
    recomendaciones: int = 0
    fotos_trabajos: Optional[List[Foto]] = None
    horarios_atencion: str = Field(
        ..., description="Horarios de atención del profesional"
    )
    nacimiento: str = Field(
        ..., description="Fecha de nacimiento del profesional (en formato YYYY-MM-DD)"
    )
    rubro_nombre: str = Field(
        ..., description="Nombre del rubro al que pertenece el profesional"
    )
    profesion_nombre: str = Field(
        ..., description="Nombre de la profesión del profesional"
    )
    acerca_de_mi: Optional[str] = Field(
        None, description="Descripción breve del profesional"
    )


def send_otp_email(username, otp):
    subject = "Código de verificación para registro"
    body = f"Su código de verificación es: {otp}"

    message = MIMEMultipart()
    message["From"] = email
    message["To"] = username
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    # Iniciar sesión en el servidor SMTP
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()  # Habilitar cifrado TLS
        server.login(
            email, password
        )  # Iniciar sesión con correo electrónico y contraseña
        server.sendmail(
            email, username, message.as_string()
        )  # Enviar correo electrónico


@router.post("/request-registration/")
async def request_registration(cliente: Cliente):
    if cliente.plus not in ["False", "True"]:
        raise HTTPException(
            status_code=400, detail="El valor de plus debe ser 'True' o 'False'"
        )
    if (
        not cliente.nombre
        or not cliente.apellido
        or not cliente.correo
        or not cliente.password
        or not cliente.ubicacion
    ):
        raise HTTPException(status_code=400, detail="Todos los campos son requeridos")
    if not re.match(PASSWORD_REGEX, cliente.password):
        raise HTTPException(
            status_code=400, detail="La contraseña no cumple con los requisitos"
        )
    if clientes_collection.find_one({"correo": cliente.correo}):
        raise HTTPException(status_code=400, detail="El cliente ya existe")
    if profesionales_collection.find_one({"correo": cliente.correo}):
        raise HTTPException(status_code=400, detail="El correo se encuentra en uso")
    if not re.match(LOCATION_REGEX, cliente.ubicacion):
        raise HTTPException(
            status_code=400, detail="La ubicación no cumple con el formato requerido"
        )

    otp_code = str(random.randint(100000, 999999))
    otp_generated_time = datetime.now()
    send_otp_email(cliente.correo, otp_code)

    # Almacenar OTP y hora en una colección temporal
    temp_cliente = {
        "rol": cliente.rol,
        "plus": cliente.plus,
        "nombre": cliente.nombre,
        "apellido": cliente.apellido,
        "correo": cliente.correo,
        "password": cliente.password,  # No hasheado, solo para verificación posterior
        "foto_base64": cliente.foto_base64,
        "ubicacion": cliente.ubicacion,
        "otp_code": otp_code,
        "otp_generated_time": otp_generated_time,
        "fecha_registro": None,
    }
    temp_clientes_collection.insert_one(temp_cliente)

    return {
        "message": "OTP enviado al correo electrónico. Verifique para completar el registro."
    }


@router.post("/convertir-a-profesional/")
async def convertir_cliente_a_profesional(datos: DatosProfesional):
    # Buscar el cliente por su correo
    cliente = clientes_collection.find_one({"correo": datos.correo})

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Convertir la lista de fotos a una lista de diccionarios
    fotos_trabajos_dict = []
    if datos.fotos_trabajos:
        for foto in datos.fotos_trabajos:
            foto_dict = foto.dict()
            fotos_trabajos_dict.append(foto_dict)

    # Crear el diccionario de profesional
    profesional_dict = {
        "_id": cliente["_id"],  # Mantener el mismo id
        "rol": "Profesional",
        "nombre": datos.nombre,
        "apellido": datos.apellido,
        "numero": datos.numero,
        "correo": datos.correo,
        "password": cliente[
            "password"
        ],  # la contraseña ya viene hasheada desde el front
        "ubicacion": datos.ubicacion,
        "calificacion": 0.0,
        "experiencia_laboral_años": datos.experiencia_laboral_años,
        "recomendaciones": 0,
        "foto_perfil": cliente["foto_base64"],
        "fotos_trabajos": fotos_trabajos_dict,  # Lista de diccionarios en lugar de objetos Foto para que no tener el mismo error al iterar
        "horarios_atencion": datos.horarios_atencion,
        "nacimiento": datos.nacimiento,
        "rubro_nombre": datos.rubro_nombre,
        "profesion_nombre": datos.profesion_nombre,
        "acerca_de_mi": datos.acerca_de_mi,
        "fecha_registro": cliente["fecha_registro"],
    }

    try:
        # Intentar insertar el nuevo profesional con el mismo ID del cliente
        profesionales_collection.insert_one(profesional_dict)

        # Eliminar el cliente después de insertar el profesional
        clientes_collection.delete_one({"_id": cliente["_id"]})

        # Convertir ObjectId a string antes de devolver la respuesta
        profesional_dict["_id"] = str(profesional_dict["_id"])

        return {"user_data": profesional_dict}

    except PyMongoError as e:
        raise HTTPException(
            status_code=500, detail=f"Error al convertir a profesional: {str(e)}"
        )


@router.post("/verify-otp/")
async def verify_otp(correo: str = Form(...), otp: str = Form(...)):
    temp_cliente = temp_clientes_collection.find_one({"correo": correo})
    if not temp_cliente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    stored_otp = temp_cliente.get("otp_code")
    otp_generated_time = temp_cliente.get("otp_generated_time")

    if not stored_otp or not otp_generated_time:
        raise HTTPException(
            status_code=404,
            detail="No se encontró ningún código OTP generado para este usuario",
        )

    current_time = datetime.now()
    if current_time - otp_generated_time > timedelta(minutes=10):
        raise HTTPException(
            status_code=401,
            detail="El código ha expirado. Por favor, solicite un nuevo código.",
        )

    if otp != stored_otp:
        raise HTTPException(
            status_code=401, detail="El código ingresado es incorrecto."
        )

    # Eliminar el OTP y la entrada temporal
    temp_clientes_collection.delete_one({"correo": correo})

    # Crear el cliente en la colección definitiva
    hashed_password = bcrypt.hashpw(
        temp_cliente["password"].encode("utf-8"), bcrypt.gensalt()
    )
    temp_cliente["password"] = hashed_password.decode("utf-8")
    temp_cliente["fecha_registro"] = datetime.now()

    del temp_cliente["otp_code"]
    del temp_cliente["otp_generated_time"]

    # Insertar el cliente definitivo en la colección y convertir _id a str
    cliente_id = clientes_collection.insert_one(temp_cliente).inserted_id
    temp_cliente["_id"] = str(cliente_id)

    return {"message": "Cliente verificado y creado exitosamente.", **temp_cliente}


@router.get("/")
async def obtener_clientes():
    lista_clientes = []
    for cliente in clientes_collection.find():
        cliente["_id"] = str(cliente["_id"])
        cliente["fecha_registro"] = (
            cliente["fecha_registro"].strftime("%Y-%m-%d %H:%M:%S")
            if cliente["fecha_registro"]
            else None
        )
        lista_clientes.append(cliente)
    return lista_clientes


@router.post("/buscar/")
async def buscar_cliente_por_correo(json_data: dict):
    correo_cliente = json_data.get("correo")

    if not correo_cliente:
        raise HTTPException(
            status_code=400, detail="Se requiere el campo 'correo' en los datos JSON"
        )

    profesional_encontrado = clientes_collection.find_one({"correo": correo_cliente})

    if profesional_encontrado:
        profesional_encontrado["_id"] = str(profesional_encontrado["_id"])
        profesional_encontrado["fecha_registro"] = (
            profesional_encontrado.get("fecha_registro", None).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            if profesional_encontrado.get("fecha_registro")
            else None
        )
        return profesional_encontrado
    else:
        raise HTTPException(status_code=404, detail="cliente no encontrado")


@router.put("/")
async def actualizar_cliente(correo: str, campos_actualizados: dict):
    if not campos_actualizados:
        raise HTTPException(
            status_code=400, detail="No se han proporcionado campos para actualizar"
        )

    campos_actualizacion = {"$set": campos_actualizados}

    resultado = clientes_collection.update_one({"correo": correo}, campos_actualizacion)

    if resultado.modified_count == 1:
        return {"message": f"Cliente con correo {correo} actualizado exitosamente"}
    else:
        raise HTTPException(
            status_code=404, detail=f"Cliente con correo {correo} no encontrado"
        )


@router.delete("/{cliente_id}/")
async def eliminar_cliente(cliente_id: str):
    resultado = clientes_collection.delete_one({"_id": ObjectId(cliente_id)})
    if resultado.deleted_count == 1:
        return {"message": "Cliente eliminado exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")


@router.post("/favoritos/agregar/{cliente_id}/")
async def agregar_favoritos(cliente_id: str, profesionales: List[str]):
    # Verificar si el cliente existe
    cliente_existente = clientes_collection.find_one({"_id": ObjectId(cliente_id)})
    if not cliente_existente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Verificar si los profesionales existen
    for profesional_id in profesionales:
        profesional_existente = profesionales_collection.find_one(
            {"_id": ObjectId(profesional_id)}
        )
        if not profesional_existente:
            raise HTTPException(
                status_code=404,
                detail=f"Profesional con ID {profesional_id} no encontrado",
            )

    # Agregar los profesionales a la lista de favoritos del cliente
    resultado = clientes_collection.update_one(
        {"_id": ObjectId(cliente_id)},
        {"$addToSet": {"favoritos": {"$each": profesionales}}},
    )
    if resultado.modified_count == 1:
        return {
            "message": "Profesionales agregados a la lista de favoritos exitosamente"
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Error al agregar profesionales a la lista de favoritos",
        )


@router.post("/favoritos/eliminar/{cliente_id}/")
async def eliminar_favoritos(cliente_id: str, profesionales: List[str]):
    # Verificar si el cliente existe
    cliente_existente = clientes_collection.find_one({"_id": ObjectId(cliente_id)})
    if not cliente_existente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Eliminar los profesionales de la lista de favoritos del cliente
    resultado = clientes_collection.update_one(
        {"_id": ObjectId(cliente_id)}, {"$pullAll": {"favoritos": profesionales}}
    )
    if resultado.modified_count == 1:
        return {
            "message": "Profesionales eliminados de la lista de favoritos exitosamente"
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar profesionales de la lista de favoritos",
        )
