from pydantic import BaseModel
from datetime import datetime

class Denuncia(BaseModel):
    cliente_id: str  
    motivo: str  
    descripcion: str  
    fecha_creacion: datetime = datetime.now()  
