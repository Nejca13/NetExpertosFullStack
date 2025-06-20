from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId

from app.api.core import CLIENTES_COLLECTION, DENUNCIAS_COLLECTION
from ..models.denuncia import Denuncia

router = APIRouter(
    prefix="/denuncias",
    tags=["denuncias"],
    responses={404: {"message": "No encontrado"}},
)


def transform_object_id(data):
    if isinstance(data, list):
        for item in data:
            if "_id" in item:
                item["_id"] = str(item["_id"])
    elif isinstance(data, dict):
        if "_id" in data:
            data["_id"] = str(data["_id"])
    return data


@router.post("/crear-denuncia/")
async def crear_denuncia(denuncia: Denuncia):
    if not denuncia.cliente_id or not denuncia.motivo or not denuncia.descripcion:
        raise HTTPException(status_code=400, detail="Todos los campos son requeridos")

    cliente_existente = CLIENTES_COLLECTION.find_one(
        {"_id": ObjectId(denuncia.cliente_id)}
    )
    if not cliente_existente:
        raise HTTPException(
            status_code=404, detail="El cliente no existe en la base de datos"
        )

    denuncia_insertada = DENUNCIAS_COLLECTION.insert_one(denuncia.dict())
    return {
        "message": "Denuncia creada exitosamente",
        "denuncia_id": str(denuncia_insertada.inserted_id),
    }


@router.get("/")
async def obtener_denuncias(
    page: int = Query(1, gt=0), page_size: int = Query(10, gt=0)
) -> dict:
    skip = (page - 1) * page_size
    limit = page_size

    total = DENUNCIAS_COLLECTION.count_documents({})
    denuncias = list(DENUNCIAS_COLLECTION.find().skip(skip).limit(limit))

    if not denuncias:
        return {"message": "No hay denuncias actualmente."}

    transform_object_id(denuncias)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "denuncias": denuncias,
    }


@router.get("/cliente/{cliente_id}/")
async def obtener_denuncias_por_cliente_id(
    cliente_id: str, page: int = Query(1, gt=0), page_size: int = Query(10, gt=0)
):
    try:
        cliente_obj_id = ObjectId(cliente_id)
    except:
        raise HTTPException(status_code=400, detail="ID del cliente no es válido")

    skip = (page - 1) * page_size
    limit = page_size

    # Obtener las denuncias del cliente por su ID
    total = DENUNCIAS_COLLECTION.count_documents({"cliente_id": cliente_id})
    denuncias_cliente = list(
        DENUNCIAS_COLLECTION.find({"cliente_id": cliente_id}).skip(skip).limit(limit)
    )

    if not denuncias_cliente:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontraron denuncias para el cliente con ID {cliente_id}.",
        )

    transform_object_id(denuncias_cliente)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "denuncias": denuncias_cliente,
    }


@router.delete("/{denuncia_id}/")
async def eliminar_denuncia(denuncia_id: str):
    # Eliminar la denuncia por su ID de la base de datos
    resultado = DENUNCIAS_COLLECTION.delete_one({"_id": ObjectId(denuncia_id)})
    if resultado.deleted_count == 1:
        return {"message": f"Denuncia con ID {denuncia_id} eliminada exitosamente."}
    else:
        raise HTTPException(
            status_code=404, detail=f"Denuncia con ID {denuncia_id} no encontrada."
        )


@router.get("/cliente/{correo_cliente}/")
async def obtener_denuncias_cliente(
    correo_cliente: str, page: int = Query(1, gt=0), page_size: int = Query(10, gt=0)
) -> dict:
    skip = (page - 1) * page_size
    limit = page_size

    total = DENUNCIAS_COLLECTION.count_documents({"cliente_correo": correo_cliente})
    denuncias_cliente = list(
        DENUNCIAS_COLLECTION.find({"cliente_correo": correo_cliente})
        .skip(skip)
        .limit(limit)
    )

    if not denuncias_cliente:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontraron denuncias para el cliente con correo {correo_cliente}.",
        )

    transform_object_id(denuncias_cliente)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "denuncias": denuncias_cliente,
    }
