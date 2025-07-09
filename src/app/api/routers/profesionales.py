import json
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, File, HTTPException, Query, Form, UploadFile

from app.api.config.otp_config import (
    HOST_EMAIL,
    HOST_PASSWORD,
    HOST_SMTP_PORT,
    HOST_SMTP_SERVER,
)
from app.api.core import (
    CLIENTES_COLLECTION,
    PROFESIONALES_COLLECTION,
    PROFESIONES_COLLECTION,
    TEMP_PROFESIONALES_COLLECTION,
)
from app.api.utils.save_image import save_image
from ..models.profesional import Profesional
from pydantic import BaseModel
import math
from geopy.distance import geodesic
from datetime import datetime, timedelta
import bcrypt
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib, random


router = APIRouter(prefix="/profesionales", tags=["profesionales"])


# Regex
PASSWORD_REGEX = (
    "^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$"
)
NUMERO_REGEX = (
    r"^\+?([0-9]{2})?[-. ]?(\(?[0-9]{2}\)?[-. ]?)?([0-9]{4})[-. ]?([0-9]{4})$"
)
LOCATION_REGEX = r"^(-?([1-8]?\d(\.\d+)?|90(\.0+)?)),\s*(-?((1[0-7]\d(\.\d+)?|1[0-8]0(\.0+)?|\d{1,2}(\.\d+)?)))$"


def send_otp_email(username, otp):
    subject = "Código de verificación para registro"
    body = f"Su código de verificación es: {otp}"

    message = MIMEMultipart()
    message["From"] = HOST_EMAIL
    message["To"] = username
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    # Iniciar sesión en el servidor SMTP
    with smtplib.SMTP_SSL(HOST_SMTP_SERVER, HOST_SMTP_PORT) as server:
        # Habilitar cifrado TLS
        server.login(
            HOST_EMAIL, HOST_PASSWORD
        )  # Iniciar sesión con correo electrónico y contraseña
        server.sendmail(
            HOST_EMAIL, username, message.as_string()
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
    if PROFESIONALES_COLLECTION.find_one({"correo": profesional.correo}):
        raise HTTPException(status_code=400, detail="El profesional ya existe")

    # Verificar el formato de la ubicación
    if not re.match(LOCATION_REGEX, profesional.ubicacion):
        raise HTTPException(
            status_code=400, detail="La ubicación no cumple con el formato requerido"
        )

    # Verificar si el correo ya está en uso por un cliente
    if CLIENTES_COLLECTION.find_one({"correo": profesional.correo}):
        raise HTTPException(status_code=400, detail="El correo se encuentra en uso")

    # Verificar si la profesión especificada existe
    profesion_existente = PROFESIONES_COLLECTION.find_one(
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
    TEMP_PROFESIONALES_COLLECTION.insert_one(temp_profesional)

    return {
        "message": "OTP enviado al correo electrónico. Verifique para completar el registro."
    }


@router.post("/verify-otp/")
async def verify_otp(correo: str = Form(...), otp: str = Form(...)):
    temp_profesional = TEMP_PROFESIONALES_COLLECTION.find_one({"correo": correo})
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
    TEMP_PROFESIONALES_COLLECTION.delete_one({"correo": correo})

    # Crear el profesioanl en la colección definitiva
    hashed_password = bcrypt.hashpw(
        temp_profesional["password"].encode("utf-8"), bcrypt.gensalt()
    )
    temp_profesional["password"] = hashed_password.decode("utf-8")
    temp_profesional["fecha_registro"] = datetime.now()

    del temp_profesional["otp_code"]
    del temp_profesional["otp_generated_time"]

    # Insertar el cliente definitivo en la colección y convertir _id a str
    profesional_id = PROFESIONALES_COLLECTION.insert_one(temp_profesional).inserted_id
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
    total_profesionales = PROFESIONALES_COLLECTION.count_documents(
        {"profesion_nombre": profesion}
    )

    # Calcular el índice inicial y final de los profesionales a retornar
    skip = (page - 1) * page_size
    limit = page_size

    # Consultar la base de datos para obtener profesionales de la profesión especificada
    profesionales_cercanos = []
    for profesional in PROFESIONALES_COLLECTION.find({"profesion_nombre": profesion}):
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
    profesionales = PROFESIONALES_COLLECTION.find()

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
    profesional_encontrado = PROFESIONALES_COLLECTION.find_one(
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
async def crear_profesional(
    nombre: str = Form(...),
    apellido: str = Form(...),
    numero: str = Form(...),
    correo: str = Form(...),
    password: str = Form(...),
    ubicacion: str = Form(...),
    experiencia_laboral_años: int = Form(...),
    horarios_atencion: str = Form(...),
    nacimiento: str = Form(...),
    profesion_nombre: str = Form(...),
    rubro_nombre: str = Form(...),
    acerca_de_mi: str = Form(...),
    fotos_trabajos_meta: str = Form(...),
    fotos_trabajos: List[UploadFile] = File(None),
):
    # Verificar si algún campo obligatorio está vacío
    if (
        not nombre
        or not apellido
        or not numero
        or not correo
        or not password
        or not ubicacion
        or not experiencia_laboral_años
        or not horarios_atencion
        or not nacimiento
        or not profesion_nombre
        or not rubro_nombre
    ):
        raise HTTPException(status_code=400, detail="Todos los campos son requeridos")
    # Validar la contraseña con la expresión regular
    if not re.match(PASSWORD_REGEX, password):
        raise HTTPException(
            status_code=400, detail="La contraseña no cumple con los requisitos"
        )
    # Verificar si el profesional ya existe en la base de datos
    if PROFESIONALES_COLLECTION.find_one({"correo": correo}):
        raise HTTPException(status_code=400, detail="El profesional ya existe")

    if CLIENTES_COLLECTION.find_one({"correo": correo}):
        raise HTTPException(status_code=400, detail="El correo se encuentra en uso")
    # Verificar si la profesión especificada existe
    profesion_existente = PROFESIONES_COLLECTION.find_one({"nombre": rubro_nombre})
    if not profesion_existente:
        raise HTTPException(status_code=400, detail="La profesion no existe")
    # Verificar si el rubro especificado pertenece a la profesión indicada
    if profesion_nombre not in profesion_existente.get("descripcion", []):
        raise HTTPException(
            status_code=400,
            detail=f"No existe el rubro '{profesion_nombre}' en el rubro '{rubro_nombre}'",
        )
    try:
        # Intenta parsear la fecha de nacimiento en el formato esperado
        fecha_nacimiento = datetime.strptime(nacimiento, "%Y-%m-%d")
    except ValueError:
        # Si hay un error al parsear la fecha, lanza una excepción
        raise HTTPException(
            status_code=400,
            detail="El formato de la fecha de nacimiento debe ser año-mes-dia (YYYY-MM-DD)",
        )
    # Formato del número de teléfono
    if not re.match(NUMERO_REGEX, numero):
        raise HTTPException(
            status_code=400,
            detail="El formato del número de teléfono no es válido para Argentina",
        )
    # Almacenar el rubro como profesión y la subcategoría como rubro
    if fecha_registro is None:
        fecha_registro = datetime.now()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    profesional_dict = dict()
    profesional_dict["password"] = hashed_password.decode(
        "utf-8"
    )  # almacenar la contraseña cifrada en lugar de la original
    profesional_dict["profesion_nombre"] = profesion_nombre
    profesional_dict["rubro_nombre"] = rubro_nombre
    try:
        meta_list = json.loads(fotos_trabajos_meta)
    except json.JSONDecodeError:
        raise HTTPException(400, "Metadata de fotos inválida")
    if fotos_trabajos:
        if len(meta_list) != len(fotos_trabajos):
            raise HTTPException(400, "Cantidad de imágenes y metadata no coincide")
    else:
        meta_list = []
    fotos_final = []
    for idx, md in enumerate(meta_list):
        upload = fotos_trabajos[idx]
        try:
            url = await save_image(upload, f"profesionales/{correo}")
        except ValueError as e:
            raise HTTPException(400, f"Error en imagen '{upload.filename}': {e}")
        fotos_final.append(
            {
                "titulo": md.get("titulo"),
                "lugar": md.get("lugar"),
                "fecha": md.get("fecha"),
                "foto": url,
            }
        )
    profesional_id = PROFESIONALES_COLLECTION.insert_one(profesional_dict).inserted_id
    return {"id": str(profesional_id), "message": "Profesional creado exitosamente"}


@router.delete("/")
async def eliminar_profesional_por_correo(correo: str):
    # Buscar al profesional por su correo en la base de datos
    profesional_encontrado = PROFESIONALES_COLLECTION.find_one({"correo": correo})
    if profesional_encontrado:
        # Eliminar al profesional de la base de datos
        PROFESIONALES_COLLECTION.delete_one({"_id": profesional_encontrado["_id"]})
        return {"message": "Profesional eliminado exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")


@router.put("/")
async def actualizar_profesional(
    correo: str = Form(...),  # identificador
    nombre: Optional[str] = Form(None),
    apellido: Optional[str] = Form(None),
    numero: Optional[str] = Form(None),
    ubicacion: Optional[str] = Form(None),
    experiencia_laboral_años: Optional[int] = Form(None),
    horarios_atencion: Optional[str] = Form(None),
    nacimiento: Optional[str] = Form(None),
    profesion_nombre: Optional[str] = Form(None),
    rubro_nombre: Optional[str] = Form(None),
    acerca_de_mi: Optional[str] = Form(None),
    plus: Optional[str] = Form(None),
    fotos_trabajos_meta: Optional[str] = Form(None),
    fotos_trabajos_a_eliminar: Optional[str] = Form(None),
    fotos_trabajos: Optional[List[UploadFile]] = File(None),
    foto_perfil: Optional[UploadFile] = File(None),
):
    profesional = PROFESIONALES_COLLECTION.find_one({"correo": correo})
    if not profesional:
        raise HTTPException(404, "Profesional no encontrado")

    update_data = {}

    campos = [
        "nombre",
        "apellido",
        "numero",
        "ubicacion",
        "experiencia_laboral_años",
        "horarios_atencion",
        "nacimiento",
        "profesion_nombre",
        "rubro_nombre",
        "acerca_de_mi",
    ]

    for campo in campos:
        valor = locals()[campo]
        if valor is not None:
            update_data[campo] = valor

    if plus:
        update_data["plus"] = plus.lower() == "true"

    # 📷 Subir nueva foto de perfil si se envía
    if foto_perfil:
        url_foto = await save_image(
            foto_perfil, f"profesionales/{profesional['_id']}/perfil"
        )
        update_data["foto_perfil"] = url_foto

    # 🧩 Manejo de imágenes de trabajos
    try:
        metas = json.loads(fotos_trabajos_meta or "[]")
        urls_a_eliminar = json.loads(fotos_trabajos_a_eliminar or "[]")
    except json.JSONDecodeError:
        raise HTTPException(400, "Error al parsear JSON de imágenes")

    trabajos_actuales = profesional.get("fotos_trabajos", [])
    trabajos_sin_eliminar = [
        t for t in trabajos_actuales if t["foto"] not in urls_a_eliminar
    ]
    nuevos_trabajos = []

    file_idx = 0
    for meta in metas:
        if "foto" in meta and meta["foto"].startswith("http"):
            nuevos_trabajos.append(meta)
        else:
            if fotos_trabajos and file_idx < len(fotos_trabajos):
                upload = fotos_trabajos[file_idx]
                url = await save_image(
                    upload, f"profesionales/{profesional['_id']}/trabajos"
                )
                nuevos_trabajos.append(
                    {
                        "titulo": meta.get("titulo"),
                        "lugar": meta.get("lugar"),
                        "fecha": meta.get("fecha"),
                        "foto": url,
                    }
                )
                file_idx += 1
            else:
                raise HTTPException(400, "Falta imagen para trabajo nuevo")

    update_data["fotos_trabajos"] = trabajos_sin_eliminar + nuevos_trabajos

    # ✅ Aplicar cambios
    PROFESIONALES_COLLECTION.update_one({"correo": correo}, {"$set": update_data})

    profesional["_id"] = str(profesional["_id"])
    return {
        "message": "Profesional actualizado correctamente",
        "profesional": profesional,
    }


# Obtener un profesional por ID
@router.get("/get-profesional-by-id/{profesional_id}/")
async def get_profesional_by_id(profesional_id: str):
    profesional = PROFESIONALES_COLLECTION.find_one({"_id": ObjectId(profesional_id)})
    if not profesional:
        raise HTTPException(404, "Profesional no encontrado")
    profesional["_id"] = str(profesional["_id"])
    return profesional


# GET con paginado
@router.get("/dashboard/", response_model=dict)
async def get_profesionales(
    page: int = 1,
    limit: int = 25,
    query: Optional[str] = None,
    numero: Optional[str] = None,
    rubro_nombre: Optional[str] = None,
    profesion_nombre: Optional[str] = None,
    ubicacion: Optional[str] = None,
    plus: Optional[bool] = None,
    min_calificacion: Optional[float] = None,
    max_calificacion: Optional[float] = None,
    min_recomendaciones: Optional[int] = None,
    max_recomendaciones: Optional[int] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    sort_type: Optional[str] = "desc",
):
    skip = (page - 1) * limit
    filters = {}

    if query:
        filters["$or"] = [
            {"nombre": {"$regex": query, "$options": "i"}},
            {"apellido": {"$regex": query, "$options": "i"}},
            {"correo": {"$regex": query, "$options": "i"}},
        ]
    if numero:
        filters["numero"] = numero
    if rubro_nombre:
        filters["rubro_nombre"] = rubro_nombre
    if profesion_nombre:
        filters["profesion_nombre"] = profesion_nombre
    if ubicacion:
        filters["ubicacion"] = {"$regex": ubicacion, "$options": "i"}
    if plus is not None:
        filters["plus"] = plus
    if min_calificacion is not None or max_calificacion is not None:
        filters["calificacion"] = {}
        if min_calificacion is not None:
            filters["calificacion"]["$gte"] = min_calificacion
        if max_calificacion is not None:
            filters["calificacion"]["$lte"] = max_calificacion
    if min_recomendaciones is not None or max_recomendaciones is not None:
        filters["recomendaciones"] = {}
        if min_recomendaciones is not None:
            filters["recomendaciones"]["$gte"] = min_recomendaciones
        if max_recomendaciones is not None:
            filters["recomendaciones"]["$lte"] = max_recomendaciones
    if from_date or to_date:
        filters["fecha_registro"] = {}
        if from_date:
            filters["fecha_registro"]["$gte"] = from_date
        if to_date:
            filters["fecha_registro"]["$lte"] = to_date

    sort = [("fecha_registro", 1 if sort_type == "asc" else -1)]

    total = PROFESIONALES_COLLECTION.count_documents(filters)
    cursor = PROFESIONALES_COLLECTION.find(filters).sort(sort).skip(skip).limit(limit)
    profesionales = cursor.to_list(length=limit)

    for prof in profesionales:
        prof.pop("password", None)
        prof["id"] = str(prof.pop("_id", ""))

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "profesionales": profesionales,
    }
