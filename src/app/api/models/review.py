from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CrearResena(BaseModel):
    id_profesional: str = Field(..., description="ID del profesional reseñado")
    id_cliente: str = Field(..., description="ID del usuario que deja la reseña")
    puntuacion: int = Field(..., ge=0, le=5, description="Puntaje de 0 a 5")
    comentario: Optional[str] = Field(None, description="Comentario del usuario")


class RespuestaProfesional(BaseModel):
    respuesta: str = Field(..., description="Respuesta pública del profesional")
    fecha_respuesta: datetime = Field(default_factory=datetime.utcnow)


class ResenaEnBD(BaseModel):
    id_profesional: str
    foto_profesional: Optional[str] = None
    nombre_profesional: Optional[str] = None
    id_cliente: str
    foto_cliente: Optional[str] = None
    nombre_cliente: Optional[str] = None
    puntuacion: int
    comentario: Optional[str] = None
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    respuesta_profesional: Optional[RespuestaProfesional] = None
