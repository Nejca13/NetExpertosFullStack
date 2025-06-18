from pydantic import BaseModel
from typing import Optional, List, Annotated
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
    # Campos relacionados con el OTP
    otp_code: Optional[str] = None  # Código de verificación OTP
    otp_generated_time: Optional[datetime] = (
        None  # Fecha y hora en que se generó el OTP
    )
