from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from ..models.foto import Foto


def to_camel_case(text: str) -> str:
    return " ".join(word.capitalize() for word in text.strip().lower().split())


class Profesional(BaseModel):
    rol: str = "Profesional"
    plus: Optional[bool] = False
    nombre: str
    apellido: str
    numero: str
    correo: str
    password: str
    ubicacion: Optional[str] = None
    calificacion: Optional[float] = 0.0
    experiencia_laboral_años: int
    recomendaciones: Optional[int] = 0
    foto_perfil: str
    fotos_trabajos: Optional[List[Foto]] = None
    verificado: Optional[bool] = False
    horarios_atencion: str
    nacimiento: str
    rubro_nombre: Optional[str] = None
    profesion_nombre: str
    acerca_de_mi: Optional[str] = None
    fecha_registro: Optional[datetime] = None
    otp_code: Optional[str] = None
    otp_generated_time: Optional[datetime] = None

    # Camel Case
    @field_validator("nombre", "apellido")
    def camel_case_fields(cls, v):
        return to_camel_case(v) if isinstance(v, str) else v

    @field_validator("correo", "ubicacion", "rubro_nombre", "profesion_nombre")
    def normalize_text(cls, v):
        return v.strip().lower() if isinstance(v, str) else v
