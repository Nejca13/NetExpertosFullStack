from pydantic import BaseModel


class Profesion(BaseModel):
    nombre: str
    descripcion: str