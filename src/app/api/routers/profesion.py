from fastapi import APIRouter, HTTPException, Form, Request
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from typing import Optional, List, Annotated
from fastapi.templating import Jinja2Templates
import bcrypt
from ..models.profesion import Profesion

# Conexión a la base de datos
client = MongoClient("mongodb://127.0.0.1:27017")

db = client.test
clientes_collection = db.clientes
profesionales_collection = db.profesionales
profesiones_collection = db.profesiones


router = APIRouter(prefix="/profesiones", tags=["profesiones"])


@router.get("/")
async def obtener_profesiones():
    lista_profesiones = []
    for profesion in profesiones_collection.find():
        # convertir el ObjectId a str para ahorrar error de convergencia
        profesion["_id"] = str(profesion["_id"])
        # convertir fecha_registro a string
        lista_profesiones.append(profesion)
    # convertir la lista de diccionarios a una cadena JSON
    return lista_profesiones


@router.delete("/{profesion_id}")
async def eliminar_cliente(profesion_id: str):
    resultado = profesiones_collection.delete_one({"_id": ObjectId(profesion_id)})
    if resultado.deleted_count == 1:
        return {"message": "Cliente eliminado exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Profesion no encontrada")


@router.put("/{profesion_id}")
async def actualizar_cliente(profesion_id: str, profesion: Profesion):
    profesion_actualizada = profesiones_collection.update_one(
        {"_id": ObjectId(profesion_id)}, {"$set": profesion.model_dump()}
    )
    if profesion_actualizada.modified_count == 1:
        return {"message": "Cliente actualizado exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")


# Ruta para crear profesiones
@router.post("/")
async def crear_profesion(profesion: Profesion):
    # Verificar si la profesion ya existe
    profesion_existente = profesiones_collection.find_one({"nombre": profesion.nombre})
    if profesion_existente:
        raise HTTPException(status_code=400, detail="La profesión ya existe")

    # Si la profesión no existe, se crea
    profesion_id = profesiones_collection.insert_one(profesion.dict()).inserted_id
    return {"id": str(profesion_id), **profesion.model_dump()}
