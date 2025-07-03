# app/modelos/resena.py
from pydantic import BaseModel, Field, conint
from datetime import datetime
from typing import Optional


class ResenaBase(BaseModel):
    id_profesional: str = Field(..., description="ID del profesional reseñado")
    id_usuario: str = Field(..., description="ID del usuario que deja la reseña")
    puntuacion: int = Field(..., ge=0, le=5, description="Puntaje de 0 a 5")
    comentario: Optional[str] = Field(
        None, description="Comentario del usuario sobre el servicio recibido"
    )


class CrearResena(ResenaBase):
    pass


class RespuestaProfesional(BaseModel):
    respuesta: str = Field(..., description="Respuesta pública del profesional")
    fecha_respuesta: datetime = Field(default_factory=datetime.utcnow)


class ResenaEnBD(ResenaBase):
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    respuesta_profesional: Optional[RespuestaProfesional] = None
