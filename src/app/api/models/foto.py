from pydantic import BaseModel, Extra
from typing import Optional, List, Annotated
from datetime import datetime

from fastapi import HTTPException

class Foto(BaseModel):
    titulo: str
    fecha: str
    lugar: str
    imagen_base64: str