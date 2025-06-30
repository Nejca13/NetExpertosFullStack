from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.api.core import CITAS_COLLECTION, CLIENTES_COLLECTION, PROFESIONALES_COLLECTION
from ..models.cita import Cita, CitaCalificar

router = APIRouter(
    prefix="/citas", tags=["citas"], responses={404: {"message": "No encontrado"}}
)


def cita_helper(cita) -> dict:
    return {
        "id": str(cita["_id"]),
        "cliente_id": cita["cliente_id"],
        "profesional_id": cita["profesional_id"],
        "fecha": cita["fecha"],
        "hora": cita["hora"],
        "calificacion": cita.get("calificacion"),
    }


@router.post("/crear_cita/")
async def crear_cita(cita: Cita):
    cliente_id = ObjectId(cita.cliente_id)
    profesional_id = ObjectId(cita.profesional_id)

    cliente = CLIENTES_COLLECTION.find_one({"_id": cliente_id})
    profesional = PROFESIONALES_COLLECTION.find_one({"_id": profesional_id})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if not profesional:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    cita_existente = CITAS_COLLECTION.find_one(
        {
            "profesional_id": str(profesional_id),
            "fecha": cita.fecha.isoformat(),
            "hora": cita.hora.isoformat(),
        }
    )
    if cita_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una cita en esa fecha y hora con el mismo profesional",
        )

    nueva_cita = {
        "cliente_id": str(cliente_id),
        "profesional_id": str(profesional_id),
        "fecha": cita.fecha.isoformat(),
        "hora": cita.hora.isoformat(),
        "calificacion": None,
    }
    result = CITAS_COLLECTION.insert_one(nueva_cita)
    nueva_cita["_id"] = str(result.inserted_id)

    return nueva_cita


@router.post("/calificar_cita/", response_model=Cita)
async def calificar_cita(calificacion: CitaCalificar):
    cliente_id = ObjectId(calificacion.cliente_id)
    profesional_id = ObjectId(calificacion.profesional_id)

    cita = CITAS_COLLECTION.find_one(
        {
            "cliente_id": str(cliente_id),
            "profesional_id": str(profesional_id),
            "fecha": calificacion.fecha.isoformat(),
            "hora": calificacion.hora.isoformat(),
        }
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    CITAS_COLLECTION.update_one(
        {"_id": cita["_id"]}, {"$set": {"calificacion": calificacion.calificacion}}
    )

    todas_las_citas = CITAS_COLLECTION.find(
        {"profesional_id": str(profesional_id), "calificacion": {"$ne": None}}
    )
    total_calificaciones = 0
    suma_calificaciones = 0
    async for cita in todas_las_citas:
        suma_calificaciones += cita["calificacion"]
        total_calificaciones += 1
    promedio_calificacion = (
        suma_calificaciones / total_calificaciones if total_calificaciones > 0 else 0
    )

    PROFESIONALES_COLLECTION.update_one(
        {"_id": profesional_id},
        {"$set": {"calificacion_promedio": promedio_calificacion}},
    )

    cita_actualizada = CITAS_COLLECTION.find_one({"_id": cita["_id"]})
    return Cita(**cita_actualizada)


@router.delete("/cancelar_cita/")
async def cancelar_cita(cliente_id: str, profesional_id: str, fecha: str, hora: str):
    cliente_id = ObjectId(cliente_id)
    profesional_id = ObjectId(profesional_id)

    cita = CITAS_COLLECTION.find_one(
        {
            "cliente_id": str(cliente_id),
            "profesional_id": str(profesional_id),
            "fecha": fecha,
            "hora": hora,
        }
    )
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    CITAS_COLLECTION.delete_one({"_id": cita["_id"]})

    return {"message": "Cita cancelada exitosamente"}


@router.get("/citas_profesional/{correo}/")
async def obtener_citas_profesional(correo: str):
    profesional = PROFESIONALES_COLLECTION.find_one({"correo": correo})
    if not profesional:
        raise HTTPException(status_code=404, detail="Profesional no encontrado")

    profesional_id = str(profesional["_id"])
    citas = CITAS_COLLECTION.find({"profesional_id": profesional_id}).to_list(
        length=None
    )

    if not citas:
        return {"message": "No se encontraron citas para este profesional"}

    return [cita_helper(cita) for cita in citas]


@router.get("/citas_cliente/{correo}/")
async def obtener_citas_cliente(correo: str):
    cliente = CLIENTES_COLLECTION.find_one({"correo": correo})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    cliente_id = str(cliente["_id"])
    citas = CITAS_COLLECTION.find({"cliente_id": cliente_id}).to_list(length=None)

    if not citas:
        return {"message": "No se encontraron citas para este cliente"}

    return [cita_helper(cita) for cita in citas]


@router.patch("/modificar_cita/{cita_id}/")
async def modificar_cita(cita_id: str, nueva_fecha: str = None, nueva_hora: str = None):
    # Verificar si la cita existe
    cita = CITAS_COLLECTION.find_one({"_id": cita_id})
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    # Actualizar la fecha y/o hora si se proporcionan valores nuevos
    if nueva_fecha:
        CITAS_COLLECTION.update_one({"_id": cita_id}, {"$set": {"fecha": nueva_fecha}})
    if nueva_hora:
        CITAS_COLLECTION.update_one({"_id": cita_id}, {"$set": {"hora": nueva_hora}})

    # Obtener la cita actualizada
    cita_actualizada = CITAS_COLLECTION.find_one({"_id": cita_id})
    return cita_helper(cita_actualizada)
