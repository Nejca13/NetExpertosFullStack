from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, time

class Cita(BaseModel):
    cliente_id: str
    profesional_id: str
    fecha: date
    hora: time
    calificacion: Optional[int] = Field(default=None)
    comentario: str

class CitaCalificar(BaseModel):
    cliente_id: str
    profesional_id: str
    fecha: date
    hora: time
    calificacion: int