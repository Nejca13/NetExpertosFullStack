from pydantic import BaseModel
from typing import Optional, List, Annotated
from datetime import datetime
from ..models.foto import Foto
from typing import Optional, List, Annotated


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
    fotos_trabajos: Optional[List[Foto]] = None  # Lista de objetos Foto
    horarios_atencion: str
    nacimiento: str
    rubro_nombre: Optional[str] = None
    profesion_nombre: str
    acerca_de_mi: Optional[str] = None
    fecha_registro: Optional[datetime] = None
    # Campos relacionados con el OTP
    otp_code: Optional[str] = None  # Código de verificación OTP
    otp_generated_time: Optional[datetime] = (
        None  # Fecha y hora en que se generó el OTP
    )
