from fastapi import APIRouter, HTTPException, Query, Body, Form
from pymongo import MongoClient
from ..models.profesional import Profesional
from typing import List
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import math
import json
from geopy.distance import geodesic
from datetime import datetime, timedelta
import bcrypt
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib, random

# Conexión a la base de datos
client = MongoClient("mongodb://127.0.0.1:27017")
db = client.test
clientes_collection = db.clientes
profesionales_collection = db.profesionales
profesiones_collection = db.profesiones
temp_profesionales_collection = (
    db.temp_profesionales
)  # Colección temporal para almacenar profesioanles antes de verificar OTP


router = APIRouter(prefix="/profesionales", tags=["profesionales"])


# Regex
PASSWORD_REGEX = (
    "^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$"
)
NUMERO_REGEX = (
    r"^\+?([0-9]{2})?[-. ]?(\(?[0-9]{2}\)?[-. ]?)?([0-9]{4})[-. ]?([0-9]{4})$"
)
LOCATION_REGEX = r"^(-?([1-8]?\d(\.\d+)?|90(\.0+)?)),\s*(-?((1[0-7]\d(\.\d+)?|1[0-8]0(\.0+)?|\d{1,2}(\.\d+)?)))$"

# Configuración del servidor SMTP
smtp_server = "c2710770.ferozo.com"
smtp_port = 465  # Puerto estándar para SMTP con cifrado TLS
email = "verify@netexpertos.com"
password = "AF/1J6E5kK"


def send_otp_email(username, otp):
    subject = "Código de verificación para registro"
    body = f"Su código de verificación es: {otp}"

    message = MIMEMultipart()
    message["From"] = email
    message["To"] = username
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    # Iniciar sesión en el servidor SMTP
    with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
        # Habilitar cifrado TLS
        server.login(
            email, password
        )  # Iniciar sesión con correo electrónico y contraseña
        server.sendmail(
            email, username, message.as_string()
        )  # Enviar correo electrónico


# Función para calcular la distancia entre dos puntos geográficos usando la fórmula haversine
def haversine(lat1, lon1, lat2, lon2):
    radio_tierra = 6371.0  # Radio de la Tierra en kilómetros
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distancia = radio_tierra * c
    return distancia


# Definir el modelo de respuesta para un profesional cercano
class ProfesionalCercano(BaseModel):
    profesional: Profesional
    distancia: float


@router.post("/request-registration/")
async def request_registration(profesional: Profesional):

    # Verificar que todos los campos requeridos estén presentes
    if not all(
        [
            profesional.nombre,
            profesional.apellido,
            profesional.numero,
            profesional.correo,
            profesional.password,
            profesional.ubicacion,
            profesional.experiencia_laboral_años,
            profesional.horarios_atencion,
            profesional.nacimiento,
            profesional.profesion_nombre,
            profesional.rubro_nombre,
        ]
    ):
        raise HTTPException(status_code=400, detail="Todos los campos son requeridos")

    # Validar la contraseña con la expresión regular
    if not re.match(PASSWORD_REGEX, profesional.password):
        raise HTTPException(
            status_code=400, detail="La contraseña no cumple con los requisitos"
        )

    # Verificar si el profesional ya existe en la base de datos
    if profesionales_collection.find_one({"correo": profesional.correo}):
        raise HTTPException(status_code=400, detail="El profesional ya existe")

    # Verificar el formato de la ubicación
    if not re.match(LOCATION_REGEX, profesional.ubicacion):
        raise HTTPException(
            status_code=400, detail="La ubicación no cumple con el formato requerido"
        )

    # Verificar si el correo ya está en uso por un cliente
    if clientes_collection.find_one({"correo": profesional.correo}):
        raise HTTPException(status_code=400, detail="El correo se encuentra en uso")

    # Verificar si la profesión especificada existe
    profesion_existente = profesiones_collection.find_one(
        {"nombre": profesional.rubro_nombre}
    )
    if not profesion_existente:
        raise HTTPException(status_code=400, detail="La profesión no existe")

    # Verificar si el rubro especificado pertenece a la profesión indicada
    if profesional.profesion_nombre not in profesion_existente.get("descripcion", []):
        raise HTTPException(
            status_code=400,
            detail=f"No existe el rubro '{profesional.profesion_nombre}' en el rubro '{profesional.rubro_nombre}'",
        )

    try:
        # Intenta parsear la fecha de nacimiento en el formato esperado
        fecha_nacimiento = datetime.strptime(profesional.nacimiento, "%Y-%m-%d")
    except ValueError:
        # Si hay un error al parsear la fecha, lanza una excepción
        raise HTTPException(
            status_code=400,
            detail="El formato de la fecha de nacimiento debe ser año-mes-dia (YYYY-MM-DD)",
        )

    # Verificar el formato del número de teléfono
    if not re.match(NUMERO_REGEX, profesional.numero):
        raise HTTPException(
            status_code=400,
            detail="El formato del número de teléfono no es válido para Argentina",
        )

    # Generar un código OTP y su tiempo de generación
    otp_code = str(random.randint(100000, 999999))
    otp_generated_time = datetime.now()
    send_otp_email(profesional.correo, otp_code)

    # Almacenar OTP y hora en una colección temporal
    temp_profesional = profesional.dict()
    temp_profesional.update(
        {
            "otp_code": otp_code,
            "otp_generated_time": otp_generated_time,
            "fecha_registro": None,
        }
    )
    temp_profesionales_collection.insert_one(temp_profesional)

    return {
        "message": "OTP enviado al correo electrónico. Verifique para completar el registro."
    }


@router.post("/verify-otp/")
async def verify_otp(correo: str = Form(...), otp: str = Form(...)):
    temp_profesional = temp_profesionales_collection.find_one({"correo": correo})
    if not temp_profesional:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    stored_otp = temp_profesional.get("otp_code")
    otp_generated_time = temp_profesional.get("otp_generated_time")

    if not stored_otp or not otp_generated_time:
        raise HTTPException(
            status_code=404,
            detail="No se encontró ningún código OTP generado para este usuario",
        )

    current_time = datetime.now()
    if current_time - otp_generated_time > timedelta(minutes=30):
        raise HTTPException(
            status_code=401,
            detail="El código ha expirado. Por favor, solicite un nuevo código.",
        )

    if otp != stored_otp:
        raise HTTPException(
            status_code=401, detail="El código ingresado es incorrecto."
        )

    # Eliminar el OTP y la entrada temporal
    temp_profesionales_collection.delete_one({"correo": correo})

    # Crear el profesioanl en la colección definitiva
    hashed_password = bcrypt.hashpw(
        temp_profesional["password"].encode("utf-8"), bcrypt.gensalt()
    )
    temp_profesional["password"] = hashed_password.decode("utf-8")
    temp_profesional["fecha_registro"] = datetime.now()

    del temp_profesional["otp_code"]
    del temp_profesional["otp_generated_time"]

    # Insertar el cliente definitivo en la colección y convertir _id a str
    profesional_id = profesionales_collection.insert_one(temp_profesional).inserted_id
    temp_profesional["_id"] = str(profesional_id)

    return {"message": "Cliente verificado y creado exitosamente.", **temp_profesional}


# Endpoint para obtener profesionales cercanos dentro de un rango específico
@router.get("/cercanos/{profesion}/")
async def obtener_profesionales_cercanos(
    latitud: str,
    longitud: str,
    profesion: str,
    rango_km: float = Query(
        ..., description="Rango en kilómetros para filtrar profesionales"
    ),
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0),
):
    try:
        # Convertir latitud y longitud de cadenas a flotantes
        latitud = float(latitud)
        longitud = float(longitud)
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Latitud y longitud deben ser números válidos"
        )

    # Calcular el total de profesionales para la profesión especificada
    total_profesionales = profesionales_collection.count_documents(
        {"profesion_nombre": profesion}
    )

    # Calcular el índice inicial y final de los profesionales a retornar
    skip = (page - 1) * page_size
    limit = page_size

    # Consultar la base de datos para obtener profesionales de la profesión especificada
    profesionales_cercanos = []
    for profesional in profesionales_collection.find({"profesion_nombre": profesion}):
        if profesional.get("ubicacion"):
            # Convertir las coordenadas de la ubicación del profesional de cadenas a flotantes
            lat_pro, long_pro = map(float, profesional["ubicacion"].split(","))
            # Calcular la distancia entre el punto dado y la ubicación del profesional
            distancia = haversine(latitud, longitud, lat_pro, long_pro)
            # Verificar si la distancia está dentro del rango especificado
            if distancia <= rango_km:
                # Convertir ObjectId a cadena
                profesional["_id"] = str(profesional["_id"])
                # Agregar el profesional y su distancia a la lista de profesionales cercanos
                profesionales_cercanos.append(
                    {"profesional": profesional, "distancia": distancia}
                )

    # Ordenar los profesionales por distancia
    profesionales_cercanos.sort(key=lambda x: x["distancia"])

    # Devolver la lista de profesionales cercanos y la información de paginación
    return {
        "total": len(profesionales_cercanos),
        "page": page,
        "page_size": page_size,
        "profesionales_cercanos": profesionales_cercanos[skip : skip + limit],
    }


# --------------------------------------------------------EN FUNCIONAMIENTO--------------------------------------------------------------------------------------------
@router.get("/")
async def obtener_profesionales(
    lat: float = Query(..., description="Latitud del punto de referencia"),
    lon: float = Query(..., description="Longitud del punto de referencia"),
    rango_km: float = Query(
        ..., description="Rango en kilómetros para filtrar profesionales"
    ),
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0),
) -> dict:
    # Calcular el índice inicial y final de los profesionales a retornar
    skip = (page - 1) * page_size
    limit = page_size

    # Obtener profesionales de la base de datos
    profesionales = profesionales_collection.find()

    # Lista para almacenar los profesionales con la distancia
    profesionales_con_distancia = []

    # Calcular la distancia para cada profesional y agregarla a la lista
    for profesional in profesionales:
        # Obtener la ubicación del profesional como una cadena "latitud,longitud"
        ubicacion = profesional["ubicacion"]
        # Dividir la cadena en latitud y longitud
        latitud, longitud = map(float, ubicacion.split(","))
        # Calcular la distancia entre el punto de referencia y la ubicación del profesional
        distancia = geodesic((lat, lon), (latitud, longitud)).kilometers

        if distancia <= rango_km:
            # Convertir ObjectId a str para evitar errores de serialización
            profesional["_id"] = str(profesional["_id"])
            # Convertir fecha_registro a string si existe
            profesional["fecha_registro"] = (
                profesional.get("fecha_registro", None).strftime("%Y-%m-%d %H:%M:%S")
                if profesional.get("fecha_registro")
                else None
            )

            # Agregar la distancia al profesional
            profesional["distancia_km"] = distancia
            profesionales_con_distancia.append(profesional)

    # Devolver la lista de profesionales con la información de paginación
    return {
        "total": len(profesionales_con_distancia),
        "page": page,
        "page_size": page_size,
        "profesionales": profesionales_con_distancia[skip : skip + limit],
    }


@router.post("/buscar/")
async def buscar_profesional_por_correo(json_data: dict):
    correo_profesional = json_data.get("correo")
    if not correo_profesional:
        raise HTTPException(
            status_code=400, detail="Se requiere el campo 'correo' en los datos JSON"
        )
    # Buscar al profesional por su correo en la base de datos
    profesional_encontrado = profesionales_collection.find_one(
        {"correo": correo_profesional}
    )
    if profesional_encontrado:
        # Convertir ObjectId a cadena
        profesional_encontrado["_id"] = str(profesional_encontrado["_id"])
        # Convertir fecha_registro a string si existe
        profesional_encontrado["fecha_registro"] = (
            profesional_encontrado.get("fecha_registro", None).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            if profesional_encontrado.get("fecha_registro")
            else None
        )
        return profesional_encontrado
    else:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")


@router.post("/")
async def crear_profesional(profesional: Profesional):
    # Verificar si algún campo obligatorio está vacío
    if (
        not profesional.nombre
        or not profesional.apellido
        or not profesional.numero
        or not profesional.correo
        or not profesional.password
        or not profesional.ubicacion
        or not profesional.experiencia_laboral_años
        or not profesional.horarios_atencion
        or not profesional.nacimiento
        or not profesional.profesion_nombre
        or not profesional.rubro_nombre
    ):
        raise HTTPException(status_code=400, detail="Todos los campos son requeridos")
    # Validar la contraseña con la expresión regular
    if not re.match(PASSWORD_REGEX, profesional.password):
        raise HTTPException(
            status_code=400, detail="La contraseña no cumple con los requisitos"
        )
    # Verificar si el profesional ya existe en la base de datos
    if profesionales_collection.find_one({"correo": profesional.correo}):
        raise HTTPException(status_code=400, detail="El profesional ya existe")

    if clientes_collection.find_one({"correo": profesional.correo}):
        raise HTTPException(status_code=400, detail="El correo se encuentra en uso")
    # Verificar si la profesión especificada existe
    profesion_existente = profesiones_collection.find_one(
        {"nombre": profesional.rubro_nombre}
    )
    if not profesion_existente:
        raise HTTPException(status_code=400, detail="La profesion no existe")
    # Verificar si el rubro especificado pertenece a la profesión indicada
    if profesional.profesion_nombre not in profesion_existente.get("descripcion", []):
        raise HTTPException(
            status_code=400,
            detail=f"No existe el rubro '{profesional.profesion_nombre}' en el rubro '{profesional.rubro_nombre}'",
        )
    try:
        # Intenta parsear la fecha de nacimiento en el formato esperado
        fecha_nacimiento = datetime.strptime(profesional.nacimiento, "%Y-%m-%d")
    except ValueError:
        # Si hay un error al parsear la fecha, lanza una excepción
        raise HTTPException(
            status_code=400,
            detail="El formato de la fecha de nacimiento debe ser año-mes-dia (YYYY-MM-DD)",
        )
    # Formato del número de teléfono
    if not re.match(NUMERO_REGEX, profesional.numero):
        raise HTTPException(
            status_code=400,
            detail="El formato del número de teléfono no es válido para Argentina",
        )
    # Almacenar el rubro como profesión y la subcategoría como rubro
    if profesional.fecha_registro is None:
        profesional.fecha_registro = datetime.now()
    hashed_password = bcrypt.hashpw(
        profesional.password.encode("utf-8"), bcrypt.gensalt()
    )
    profesional_dict = profesional.dict()
    profesional_dict["password"] = hashed_password.decode(
        "utf-8"
    )  # almacenar la contraseña cifrada en lugar de la original
    profesional_dict["profesion_nombre"] = profesional.profesion_nombre
    profesional_dict["rubro_nombre"] = profesional.rubro_nombre
    profesional_id = profesionales_collection.insert_one(profesional_dict).inserted_id
    return {"id": str(profesional_id), **profesional.model_dump()}


@router.delete("/")
async def eliminar_profesional_por_correo(correo: str):
    # Buscar al profesional por su correo en la base de datos
    profesional_encontrado = profesionales_collection.find_one({"correo": correo})
    if profesional_encontrado:
        # Eliminar al profesional de la base de datos
        profesionales_collection.delete_one({"_id": profesional_encontrado["_id"]})
        return {"message": "Profesional eliminado exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")


@router.put("/")
async def actualizar_profesional(correo: str, campos_actualizados: dict):
    # Verificar si hay campos para actualizar
    if not campos_actualizados:
        raise HTTPException(
            status_code=400, detail="No se han proporcionado campos para actualizar"
        )

    # Construir el diccionario de actualización
    campos_actualizacion = {"$set": campos_actualizados}

    # Actualizar el profesional por correo
    resultado = profesionales_collection.update_one(
        {"correo": correo}, campos_actualizacion
    )

    if resultado.modified_count == 1:
        return {"message": f"Profesional con correo {correo} actualizado exitosamente"}
    else:
        raise HTTPException(
            status_code=404, detail=f"Profesional con correo {correo} no encontrado"
        )
