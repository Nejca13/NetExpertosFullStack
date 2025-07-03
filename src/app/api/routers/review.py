# app/rutas/resenas.py
from fastapi import APIRouter, HTTPException, Query
from pymongo import ASCENDING, DESCENDING
from app.api.core import (
    REVIEWS_COLLECTION,
    PROFESIONALES_COLLECTION,
    CLIENTES_COLLECTION,
)
from bson import ObjectId
from datetime import datetime
from fastapi import Query
from fastapi.responses import JSONResponse
from pymongo import DESCENDING, ASCENDING
import math

from app.api.models.review import CrearResena, ResenaEnBD, RespuestaProfesional

router = APIRouter(prefix="/reviews", tags=["Reseñas"])


@router.post("/")
async def crear_resena(resena: CrearResena, client_id: str):
    ya_existe = REVIEWS_COLLECTION.find_one(
        {"id_cliente": client_id, "id_profesional": resena.id_profesional}
    )
    if ya_existe:
        raise HTTPException(
            status_code=400, detail="Ya enviaste una reseña a este profesional."
        )

    profesional = PROFESIONALES_COLLECTION.find_one(
        {"_id": ObjectId(resena.id_profesional)}
    )
    if not profesional:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    cliente = CLIENTES_COLLECTION.find_one({"_id": ObjectId(resena.id_cliente)})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    nombre_cliente = (
        f"{cliente.get('nombre', '')} {cliente.get('apellido', '')}".strip()
    )
    foto_cliente = cliente.get("foto_perfil")

    nombre_profesional = (
        f"{profesional.get('nombre', '')} {profesional.get('apellido', '')}".strip()
    )
    foto_profesional = profesional.get("foto_perfil")

    nueva_resena = ResenaEnBD(
        **resena.dict(),
        nombre_cliente=nombre_cliente,
        foto_cliente=foto_cliente,
        nombre_profesional=nombre_profesional,
        foto_profesional=foto_profesional,
        fecha_creacion=datetime.utcnow(),
    )

    result = REVIEWS_COLLECTION.insert_one(nueva_resena.dict())

    # Recuperar el documento con el _id generado
    inserted_doc = REVIEWS_COLLECTION.find_one({"_id": result.inserted_id})

    # Convertir _id a string para que sea serializable
    inserted_doc["_id"] = str(inserted_doc["_id"])
    return inserted_doc


@router.get("/{id_profesional}/")
async def listar_resenas(
    id_profesional: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    ordenar_por: str = Query("fecha_creacion", pattern="^(fecha_creacion|puntuacion)$"),
    orden: str = Query("desc", pattern="^(asc|desc)$"),
):
    sort_order = DESCENDING if orden == "desc" else ASCENDING

    total_items = REVIEWS_COLLECTION.count_documents({"id_profesional": id_profesional})
    total_pages = max(math.ceil(total_items / limit), 1)

    if page > total_pages:
        raise HTTPException(
            status_code=400,
            detail=f"La página solicitada ({page}) supera el total disponible ({total_pages}).",
        )

    skip = (page - 1) * limit

    cursor = (
        REVIEWS_COLLECTION.find({"id_profesional": id_profesional})
        .sort(ordenar_por, sort_order)
        .skip(skip)
        .limit(limit)
    )

    pipeline = [
        {"$match": {"id_profesional": id_profesional}},
        {
            "$group": {
                "_id": "$id_profesional",
                "promedio": {"$avg": "$puntuacion"},
                "cantidad": {"$sum": 1},
            }
        },
    ]

    resultado = list(REVIEWS_COLLECTION.aggregate(pipeline))
    if not resultado:
        return {"id_profesional": id_profesional, "promedio": 0, "cantidad": 0}

    res = resultado[0]

    resenas = []

    for r in cursor:
        r["_id"] = str(r["_id"])
        r["fecha_creacion"] = str(r["fecha_creacion"])
        if r.get("respuesta_profesional") and r["respuesta_profesional"].get(
            "fecha_respuesta"
        ):
            r["respuesta_profesional"]["fecha_respuesta"] = str(
                r["respuesta_profesional"]["fecha_respuesta"]
            )
        resenas.append(r)

    return JSONResponse(
        content={
            "resenas": resenas,
            "promedio": res["promedio"],
            "cantidad": res["cantidad"],
            "page": page,
            "limit": limit,
            "total_items": total_items,
            "total_pages": total_pages,
        }
    )


@router.patch("/{id_resena}/respuesta/", response_model=ResenaEnBD)
async def responder_resena(
    id_resena: str, respuesta: RespuestaProfesional, id_profesional: str
):
    resena = REVIEWS_COLLECTION.find_one({"_id": ObjectId(id_resena)})

    if not resena:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")

    if resena.get("respuesta_profesional"):
        raise HTTPException(status_code=400, detail="La reseña ya tiene una respuesta")

    if resena["id_profesional"] != str(id_profesional):
        raise HTTPException(
            status_code=403, detail="No tenés permiso para responder esta reseña"
        )

    REVIEWS_COLLECTION.update_one(
        {"_id": ObjectId(id_resena)},
        {"$set": {"respuesta_profesional": respuesta.dict()}},
    )

    resena["respuesta_profesional"] = respuesta.dict()
    return ResenaEnBD(**resena)


@router.get("/promedio/{id_profesional}/")
async def obtener_promedio_profesional(id_profesional: str):
    pipeline = [
        {"$match": {"id_profesional": id_profesional}},
        {
            "$group": {
                "_id": "$id_profesional",
                "promedio": {"$avg": "$puntuacion"},
                "cantidad": {"$sum": 1},
            }
        },
    ]

    resultado = list(REVIEWS_COLLECTION.aggregate(pipeline))
    if not resultado:
        return {"id_profesional": id_profesional, "promedio": 0, "cantidad": 0}

    r = resultado[0]
    return {
        "id_profesional": r["_id"],
        "promedio": round(r["promedio"], 2),
        "cantidad": r["cantidad"],
    }
