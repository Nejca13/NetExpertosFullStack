from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.api.core import PROFESIONES_COLLECTION
from ..models.profesion import Profesion


router = APIRouter(prefix="/profesiones", tags=["profesiones"])


@router.get("/")
async def obtener_profesiones():
    lista_profesiones = []
    for profesion in PROFESIONES_COLLECTION.find():
        # convertir el ObjectId a str para ahorrar error de convergencia
        profesion["_id"] = str(profesion["_id"])
        # convertir fecha_registro a string
        lista_profesiones.append(profesion)
    # convertir la lista de diccionarios a una cadena JSON
    return lista_profesiones


@router.delete("/{profesion_id}/")
async def eliminar_cliente(profesion_id: str):
    resultado = PROFESIONES_COLLECTION.delete_one({"_id": ObjectId(profesion_id)})
    if resultado.deleted_count == 1:
        return {"message": "Cliente eliminado exitosamente"}
    else:
        raise HTTPException(status_code=404, detail="Profesion no encontrada")


@router.put("/{profesion_id}/")
async def actualizar_cliente(profesion_id: str, profesion: Profesion):
    profesion_actualizada = PROFESIONES_COLLECTION.update_one(
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
    profesion_existente = PROFESIONES_COLLECTION.find_one({"nombre": profesion.nombre})
    if profesion_existente:
        raise HTTPException(status_code=400, detail="La profesión ya existe")

    # Si la profesión no existe, se crea
    profesion_id = PROFESIONES_COLLECTION.insert_one(profesion.dict()).inserted_id
    return {"id": str(profesion_id), **profesion.model_dump()}
