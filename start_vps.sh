#!/bin/bash

# Verificar si existe el entorno virtual
if [ ! -d "src/app/api/venv" ]; then
    echo -e "El entorno virtual no existe, creando..."
    python3 -m venv src/app/api/venv
fi 

source src/app/api/venv/bin/activate

echo -e "Instalando dependencias de Python..."
(pip install -r src/app/api/requirements.txt > /dev/null 2>&1) & 
echo -e "Dependencias de Python instaladas exitosamente."

export PYTHONPATH=$(pwd)/src

uvicorn src.app.api.main:app --host 0.0.0.0 --port 8000
