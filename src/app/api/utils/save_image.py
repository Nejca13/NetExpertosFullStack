import os
from fastapi import UploadFile
from uuid import uuid4
from PIL import Image
from io import BytesIO

from app.api.core import BASE_URL


async def save_image(file: UploadFile, folder: str) -> str:
    """
    Guarda una imagen en formato WebP con calidad al 60% en una carpeta específica y retorna su URL.
    :param file: Archivo UploadFile recibido.
    :param folder: Carpeta donde se guardará, relativa a media/.
    :return: URL pública de la imagen.
    """
    # Verificar el formato de la imagen
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise ValueError("Formato de imagen no permitido.")

    # Crear la carpeta si no existe
    folder_path = os.path.join("media", folder)
    os.makedirs(folder_path, exist_ok=True)

    # Crear un nombre único
    unique_filename = f"{uuid4()}.webp"
    file_location = os.path.join(folder_path, unique_filename)

    # Procesar la imagen
    image = Image.open(BytesIO(await file.read()))
    image = image.convert("RGB")  # Asegurar formato RGB para WebP

    # Guardar la imagen en formato WebP con calidad 60%
    image.save(file_location, "webp", quality=60, optimize=True)

    # Retornar la URL pública
    file_url = f"{BASE_URL}/api/{file_location}"
    return file_url
