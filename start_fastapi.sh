#!/bin/bash

# Colores
RED='\033[1;38;2;237;135;150m'
GREEN='\033[1;38;2;166;218;149m'
YELLOW='\033[1;38;2;238;212;159m'
BLUE='\033[1;34m'
NC='\033[0m'

# Argumento para determinar el comando (prod o next-dev)
MODE=$1

# Validar argumento
if [[ "$MODE" != "start" && "$MODE" != "next-dev" ]]; then
    echo -e "${RED}Error: Debes pasar 'prod' o 'dev' como argumento al script.${NC}"
    exit 1
fi

# Función para mostrar un loader
function show_loader() {
    local pid=$1
    local sp="/-\|"
    local i=1
    echo -n ' '
    while [ -d "/proc/$pid" ]; do
        printf "\b${sp:i++%${#sp}:1}"
        sleep 0.1
    done
    echo -ne "\b "
}

# Función para matar todos los procesos al salir
function kill_all_processes() {
    echo -e "\n${RED}Saliendo y matando todos los procesos...${NC}"
    echo -e "\n${BLUE}Proceso Python: $SERVER_PYTHON_PID${NC}"
    echo -e "\n${BLUE}Proceso Frontend: $SERVER_FRONTEND_PID${NC}"
    kill $SERVER_PYTHON_PID
    kill $SERVER_FRONTEND_PID
    pkill -f 'pnpm'
    pkill -f 'uvicorn'
    exit 0
}

function restart_all_processes() {
    # Limpiar la pantalla
    clear &
    echo -e "\n${YELLOW}Reiniciando todos los procesos...${NC}"
    kill $SERVER_PYTHON_PID
    kill $SERVER_FRONTEND_PID
    exec "$0" "$MODE"
}

# Configurar trap para manejar Ctrl+C o salir con Q
trap kill_all_processes SIGINT

# Activar el entorno virtual
echo -e "${BLUE}Activando el entorno virtual...${NC}"
source src/app/api/venv/bin/activate && echo -e "${GREEN}Entorno virtual activado correctamente.${NC}" || {
    echo -e "${RED}Error al activar el entorno virtual.${NC}"
    exit 1
}

# Instalar dependencias de Python
echo -e "${YELLOW}Instalando dependencias de Python...${NC}"
(pip install -r src/app/api/requirements.txt > /dev/null 2>&1) &
show_loader $! && echo -e "${GREEN}Dependencias de Python instaladas exitosamente.${NC}" || {
    echo -e "${RED}Error al instalar las dependencias de Python.${NC}"
    exit 1
}

# Instalar dependencias de PNPM
echo -e "${YELLOW}Instalando dependencias de PNPM...${NC}"
(pnpm install > /dev/null 2>&1) &
show_loader $! && echo -e "${GREEN}Dependencias de PNPM instaladas exitosamente.${NC}" || {
    echo -e "${RED}Error al instalar las dependencias de PNPM.${NC}"
    exit 1
}

# Establecer PYTHONPATH
echo -e "${GREEN}Estableciendo PYTHONPATH...${NC}"
export PYTHONPATH=$(pwd)/src && echo -e "${GREEN}PYTHONPATH establecido a $(pwd)/src${NC}"

# Levantar el servidor Python
echo -e "${YELLOW}Levantando el servidor Uvicorn...${NC}"
uvicorn src.app.api.main:app --host 0.0.0.0 --port 8000 --reload &
SERVER_PYTHON_PID=$!

# Esperar un momento para asegurar que el proceso haya comenzado
sleep 2  # Puedes ajustar este valor según sea necesario

# Verificar si el proceso uvicorn está corriendo
if ps aux | grep -v grep | grep "uvicorn" > /dev/null; then
    echo -e "${GREEN}Servidor Python levantado exitosamente.${NC}"
else
    echo -e "${RED}Error al levantar el servidor Python.${NC}"
    exit 1
fi

# Si el $MODE es "start" hacer un pnpm run build antes
if [[ "$MODE" == "start" ]]; then
    echo -e "${YELLOW}Ejecutando 'pnpm run build'...${NC}"
    (pnpm run build > /dev/null 2>&1) &

    show_loader $! && echo -e "${GREEN}'pnpm run build' ejecutado exitosamente.${NC}" || {
        echo -e "${RED}Error al ejecutar 'pnpm run build'.${NC}"
        exit 1
    }
fi

# Levantar el servidor frontend (PNPM)
echo -e "${BLUE}Ejecutando 'pnpm $MODE'...${NC}"
pnpm $MODE &
SERVER_FRONTEND_PID=$!

# Esperar un momento para asegurar que el proceso haya comenzado
sleep 2  # Puedes ajustar este valor según sea necesario

# Verificar si el proceso pnpm está corriendo
if ps aux | grep -v grep | grep "pnpm" > /dev/null; then
    echo -e "${GREEN}Servidor frontend levantado exitosamente con 'pnpm $MODE'.${NC}"
else
    echo -e "${RED}Error al ejecutar 'pnpm $MODE'.${NC}"
    exit 1
fi

ACTUAL_MODE=""

if [[ "$MODE" == "start" ]]; then
    ACTUAL_MODE="Producción"
else
    ACTUAL_MODE="Desarrollo"
fi

function install_dependencies() {
    echo -e "\n${YELLOW}Elige el tipo de dependencia a instalar:${NC}"
    echo -e "${BLUE}  [P] - Instalar dependencia de pip${NC}"
    echo -e "${BLUE}  [N] - Instalar dependencia de pnpm${NC}"
    echo -e "${BLUE}  [Q] - Cancelar instalación${NC}"
    echo -e "${GREEN}Presiona la tecla correspondiente...${NC}"

    read -n 1 -s dep_type
    case $dep_type in
        p|P)
            echo -e "\n${YELLOW}Escribe el nombre de la dependencia de pip:${NC}"
            read dep_name
            if [ -n "$dep_name" ]; then
                echo -e "\n${BLUE}Instalando dependencia de pip: ${dep_name}${NC}"
                pip install "$dep_name"
                echo -e "\n${GREEN}Dependencia de pip instalada exitosamente.${NC}"
                sleep 1
                restart_all_processes
            else
                echo -e "\n${RED}Nombre de dependencia vacío. Operación cancelada.${NC}"
            fi
            ;;
        n|N)
            echo -e "\n${YELLOW}Escribe el nombre de la dependencia de pnpm:${NC}"
            read dep_name
            if [ -n "$dep_name" ]; then
                echo -e "\n${BLUE}Instalando dependencia de pnpm: ${dep_name}${NC}"
                pnpm add "$dep_name"
                echo -e "\n${GREEN}Dependencia de pnpm instalada exitosamente.${NC}"
                sleep 1
                restart_all_processes
            else
                echo -e "\n${RED}Nombre de dependencia vacío. Operación cancelada.${NC}"
            fi
            ;;
        q|Q)
            echo -e "\n${YELLOW}Cancelando instalación de dependencias.${NC}"
            ;;
        *)
            echo -e "\n${RED}Opción no válida. Regresando al menú principal.${NC}"
            ;;
    esac
}

function show_options() {
  echo -e "\n${YELLOW}Opciones disponibles modo $ACTUAL_MODE:${NC}"
  echo -e "${BLUE}  [O] - Abrir el editor de código - [Solo funciona con VSCode]${NC}"
  echo -e "${BLUE}  [F] - Abrir el navegador en el frontend${NC}"
  echo -e "${BLUE}  [B] - Abrir el navegador en el backend${NC}"
  echo -e "${BLUE}  [I] - Instalar dependencias (pip o pnpm)${NC}"
  echo -e "${BLUE}  [R] - Reiniciar todos los procesos${NC}"
  echo -e "${BLUE}  [Q] - Salir del script${NC}"
  echo -e "${GREEN}Presiona la tecla correspondiente...${NC}"
}

show_options

while true; do
    read -n 1 -s key
    case $key in
        o|O)
            echo -e "\n${BLUE}Abriendo el editor de código...${NC}"
            code . &
            ;;
        f|F)
            echo -e "\n${BLUE}Abriendo el navegador en el frontend...${NC}"
            if [ "$(xdg-settings get default-web-browser)" = "google-chrome.desktop" ]; then
                google-chrome --new-tab "http://localhost:3000" &
            else
                xdg-open "http://localhost:3000" &
            fi
            ;;
        b|B)
            echo -e "\n${BLUE}Abriendo el navegador en el backend...${NC}"
            if [ "$(xdg-settings get default-web-browser)" = "google-chrome.desktop" ]; then
                google-chrome --new-tab "http://localhost:8000/docs" &
            else
                xdg-open "http://localhost:8000/docs" &
            fi
            ;;
        i|I)
            echo -e "\n${BLUE}Iniciando instalación de dependencias...${NC}"
            install_dependencies
            ;;
        r|R)
            echo -e "\n${YELLOW}Reiniciando todos los procesos...${NC}"
            restart_all_processes
            ;;
        q|Q)
            echo -e "\n${RED}Saliendo...${NC}"
            kill_all_processes
            ;;
        *)
            echo -e "\n${YELLOW}Tecla no válida. Presiona [O], [F], [B], [I], [R] o [Q].${NC}"
            ;;
    esac
    show_options
done
