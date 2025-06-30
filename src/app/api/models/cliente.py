from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class Cliente(BaseModel):
    rol: str = "Cliente"
    plus: Optional[str] = "False"
    estado: Optional[str] = "Activo"
    favoritos: Optional[List[str]] = None
    nombre: str
    apellido: str
    correo: str
    foto_perfil: Optional[str] = None
    password: str
    ubicacion: str
    fecha_registro: Optional[datetime] = None
    otp_code: Optional[str] = None
    otp_generated_time: Optional[datetime] = None

    @field_validator("nombre", "apellido", "correo", "ubicacion")
    def normalize_text(cls, v):
        return v.strip().lower()
