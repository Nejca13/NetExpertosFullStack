import json
from fastapi import APIRouter, File, HTTPException, Form, UploadFile
import bcrypt
from datetime import datetime, timedelta

from app.api.config.otp_config import (
    HOST_EMAIL,
    HOST_PASSWORD,
    HOST_SMTP_PORT,
    HOST_SMTP_SERVER,
)
from app.api.core import (
    CLIENTES_COLLECTION,
    PROFESIONALES_COLLECTION,
    TEMP_CLIENTES_COLLECTION,
)
from app.api.utils.save_image import save_image
from bson import ObjectId
import re
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from typing import List, Optional
from ..models.foto import Foto
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError


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


@router.post("/request-registration/")
async def request_registration(
    nombre: str = Form(...),
    apellido: str = Form(...),
    correo: str = Form(...),
    password: str = Form(...),
    ubicacion: str = Form(...),
    image: UploadFile = File(...),
):
    # 1. Validaciones básicas

    if not all([nombre, apellido, correo, password, ubicacion]):
        raise HTTPException(400, "Todos los campos son requeridos")
    if not re.match(PASSWORD_REGEX, password):
        raise HTTPException(400, "La contraseña no cumple con los requisitos")
    if CLIENTES_COLLECTION.find_one({"correo": correo}):
        raise HTTPException(400, "El cliente ya existe")
    if PROFESIONALES_COLLECTION.find_one({"correo": correo}):
        raise HTTPException(400, "El correo se encuentra en uso")
    if not re.match(LOCATION_REGEX, ubicacion):
        raise HTTPException(400, "La ubicación no cumple con el formato requerido")

    # 2. Procesar la imagen (obligatoria)
    try:
        image_url = await save_image(image, "clientes")
    except ValueError as e:
        raise HTTPException(400, str(e))

    # 3. Generar y enviar OTP
    otp_code = f"{random.randint(100000, 999999):06d}"
    otp_generated_time = datetime.utcnow()
    send_otp_email(correo, otp_code)

    # 4. Almacenar en colección temporal
    temp_doc = {
        "rol": "Cliente",
        "estado": "Pendiente",  # o "Activo" según tu lógica
        "nombre": nombre,
        "apellido": apellido,
        "correo": correo,
        "password": password,  # en prod: hashéala al verificar OTP
        "ubicacion": ubicacion,
        "foto_perfil": image_url,
        "otp_code": otp_code,
        "otp_generated_time": otp_generated_time,
        "fecha_registro": None,
    }
    TEMP_CLIENTES_COLLECTION.insert_one(temp_doc)

    return {
        "message": "OTP enviado al correo electrónico. Verifique para completar el registro.",
        "expires_in_minutes": 10,
    }


@router.post("/convertir-a-profesional/")
async def convertir_cliente_a_profesional(
    nombre: str = Form(...),
    apellido: str = Form(...),
    numero: str = Form(...),
    correo: str = Form(...),
    ubicacion: str = Form(...),
    experiencia_laboral_años: int = Form(...),
    horarios_atencion: str = Form(...),
    nacimiento: str = Form(...),
    rubro_nombre: str = Form(...),
    profesion_nombre: str = Form(...),
    acerca_de_mi: str = Form(...),
    fotos_trabajos_meta: str = Form(...),  # JSON con metadata
    fotos_trabajos: List[UploadFile] = File(None),  # Archivos
):
    # 1. Validar existencia de cliente
    cliente = CLIENTES_COLLECTION.find_one({"correo": correo})
    if not cliente:
        raise HTTPException(404, "Cliente no encontrado")

    # 2. Parsear metadata JSON
    try:
        meta_list = json.loads(fotos_trabajos_meta)
    except json.JSONDecodeError:
        raise HTTPException(400, "Metadata de fotos inválida")
    if fotos_trabajos:
        if len(meta_list) != len(fotos_trabajos):
            raise HTTPException(400, "Cantidad de imágenes y metadata no coincide")
    else:
        meta_list = []

    # 3. Procesar cada imagen y emparejar con su metadata
    fotos_final = []
    for idx, md in enumerate(meta_list):
        upload = fotos_trabajos[idx]
        try:
            url = await save_image(upload, f"profesionales/{cliente['_id']}")
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

    # 4. Armar el dict final del nuevo profesional
    profesional_dict = {
        "_id": cliente["_id"],  # mantenemos el mismo ObjectId
        "rol": "Profesional",
        "nombre": nombre,
        "apellido": apellido,
        "numero": numero,
        "correo": correo,
        "password": cliente["password"],  # ya hasheada en origen
        "ubicacion": ubicacion,
        "calificacion": 0.0,
        "experiencia_laboral_años": experiencia_laboral_años,
        "recomendaciones": 0,
        "foto_perfil": cliente.get("foto_perfil"),
        "fotos_trabajos": fotos_final,  # metadata + URLs
        "horarios_atencion": horarios_atencion,
        "nacimiento": nacimiento,
        "rubro_nombre": rubro_nombre,
        "profesion_nombre": profesion_nombre,
        "acerca_de_mi": acerca_de_mi,
        "fecha_registro": cliente.get("fecha_registro"),
    }

    # 5. Insertar y limpiar
    try:
        PROFESIONALES_COLLECTION.insert_one(profesional_dict)
        CLIENTES_COLLECTION.delete_one({"_id": cliente["_id"]})

        profesional_dict["_id"] = str(profesional_dict["_id"])
        return {"user_data": profesional_dict}
    except PyMongoError as e:
        raise HTTPException(500, f"Error al convertir a profesional: {e}")


@router.post("/verify-otp/")
async def verify_otp(correo: str = Form(...), otp: str = Form(...)):
    temp_cliente = TEMP_CLIENTES_COLLECTION.find_one({"correo": correo})
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
    TEMP_CLIENTES_COLLECTION.delete_one({"correo": correo})

    # Crear el cliente en la colección definitiva
    hashed_password = bcrypt.hashpw(
        temp_cliente["password"].encode("utf-8"), bcrypt.gensalt()
    )
    temp_cliente["password"] = hashed_password.decode("utf-8")
    temp_cliente["fecha_registro"] = datetime.now()

    del temp_cliente["otp_code"]
    del temp_cliente["otp_generated_time"]

    # Insertar el cliente definitivo en la colección y convertir _id a str
    cliente_id = CLIENTES_COLLECTION.insert_one(temp_cliente).inserted_id
    temp_cliente["_id"] = str(cliente_id)

    return {"message": "Cliente verificado y creado exitosamente.", **temp_cliente}


@router.get("/")
async def obtener_clientes():
    lista_clientes = []
    for cliente in CLIENTES_COLLECTION.find():
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

    profesional_encontrado = CLIENTES_COLLECTION.find_one({"correo": correo_cliente})

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

    resultado = CLIENTES_COLLECTION.update_one({"correo": correo}, campos_actualizacion)

    if resultado.modified_count == 1:
        return {"message": f"Cliente con correo {correo} actualizado exitosamente"}
    else:
        raise HTTPException(
            status_code=404, detail=f"Cliente con correo {correo} no encontrado"
        )


@router.delete("/{cliente_id}/")
async def eliminar_cliente(cliente_id: str):
    resultado = CLIENTES_COLLECTION.delete_one({"_id": ObjectId(cliente_id)})
    if resultado.deleted_count == 1:
        return {"message": "Cliente eliminado exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")


@router.post("/favoritos/agregar/{cliente_id}/")
async def agregar_favoritos(cliente_id: str, profesionales: List[str]):
    # Verificar si el cliente existe
    cliente_existente = CLIENTES_COLLECTION.find_one({"_id": ObjectId(cliente_id)})
    if not cliente_existente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Verificar si los profesionales existen
    for profesional_id in profesionales:
        profesional_existente = PROFESIONALES_COLLECTION.find_one(
            {"_id": ObjectId(profesional_id)}
        )
        if not profesional_existente:
            raise HTTPException(
                status_code=404,
                detail=f"Profesional con ID {profesional_id} no encontrado",
            )

    # Agregar los profesionales a la lista de favoritos del cliente
    resultado = CLIENTES_COLLECTION.update_one(
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
    cliente_existente = CLIENTES_COLLECTION.find_one({"_id": ObjectId(cliente_id)})
    if not cliente_existente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Eliminar los profesionales de la lista de favoritos del cliente
    resultado = CLIENTES_COLLECTION.update_one(
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


@router.get("/dashboard", response_model=dict)
async def get_clientes(
    page: int = 1,
    limit: int = 25,
    nombre: Optional[str] = None,
    apellido: Optional[str] = None,
    correo: Optional[str] = None,
    ubicacion: Optional[str] = None,
    estado: Optional[str] = None,
    plus: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    sort_type: Optional[str] = "desc",
):
    skip = (page - 1) * limit
    filters = {}

    if nombre:
        filters["nombre"] = {"$regex": nombre, "$options": "i"}
    if apellido:
        filters["apellido"] = {"$regex": apellido, "$options": "i"}
    if correo:
        filters["correo"] = correo
    if ubicacion:
        filters["ubicacion"] = {"$regex": ubicacion, "$options": "i"}
    if estado:
        filters["estado"] = estado
    if plus:
        filters["plus"] = plus
    if from_date or to_date:
        filters["fecha_registro"] = {}
        if from_date:
            filters["fecha_registro"]["$gte"] = from_date
        if to_date:
            filters["fecha_registro"]["$lte"] = to_date

    sort = [("fecha_registro", 1 if sort_type == "asc" else -1)]

    total = CLIENTES_COLLECTION.count_documents(filters)
    cursor = CLIENTES_COLLECTION.find(filters).sort(sort).skip(skip).limit(limit)
    clientes = cursor.to_list(length=limit)

    for cliente in clientes:
        cliente.pop("password", None)
        cliente["id"] = str(cliente.pop("_id", ""))

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "clientes": clientes,
    }
