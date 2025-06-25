#!/bin/bash

# Colores
RED='\033[1;38;2;237;135;150m'
GREEN='\033[1;38;2;166;218;149m'
YELLOW='\033[1;38;2;238;212;159m'
BLUE='\033[1;34m'
NC='\033[0m'

# Detectar sistema operativo
OS="$(uname -s)"
IS_MAC=false
if [[ "$OS" == "Darwin" ]]; then
  IS_MAC=true
fi

# Argumento para determinar el comando
MODE=$1
if [[ "$MODE" != "start" && "$MODE" != "next-dev" ]]; then
  echo -e "${RED}Error: Debes pasar 'start' o 'next-dev' como argumento.${NC}"
  exit 1
fi

# Loader animado
function show_loader() {
  local pid=$1
  local sp="/-\\|"
  local i=1
  echo -n ' '
  while kill -0 $pid 2>/dev/null; do
    printf "\b${sp:i++%${#sp}:1}"
    sleep 0.1
  done
  echo -ne "\b "
}

# Abrir URL cross-platform
open_url() {
  local url=$1
  if $IS_MAC; then
    open "$url"
  else
    xdg-open "$url" > /dev/null 2>&1 &
  fi
}

# Matar procesos
function kill_all_processes() {
  echo -e "\n${RED}Saliendo y matando todos los procesos...${NC}"
  kill $SERVER_PYTHON_PID 2>/dev/null
  kill $SERVER_FRONTEND_PID 2>/dev/null
  pkill -f 'pnpm' 2>/dev/null
  pkill -f 'uvicorn' 2>/dev/null
  exit 0
}

function restart_all_processes() {
  clear
  echo -e "\n${YELLOW}Reiniciando todos los procesos...${NC}"
  kill $SERVER_PYTHON_PID 2>/dev/null
  kill $SERVER_FRONTEND_PID 2>/dev/null
  exec "$0" "$MODE"
}

trap kill_all_processes SIGINT

# Determinar binario de python
PYTHON_BIN=$(command -v python3 || command -v python)

# Crear entorno virtual si no existe
if [ ! -d "src/app/api/venv" ]; then
  echo -e "${YELLOW}Creando entorno virtual...${NC}"
  $PYTHON_BIN -m venv src/app/api/venv
fi

# Activar venv
source src/app/api/venv/bin/activate || { echo -e "${RED}Error al activar venv.${NC}"; exit 1; }

# Instalar pnpm si no existe
if ! command -v pnpm >/dev/null 2>&1; then
  echo -e "${YELLOW}Instalando pnpm...${NC}"
  npm install -g pnpm || { echo -e "${RED}Error al instalar pnpm.${NC}"; exit 1; }
fi

# Copiar .env si es necesario
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Archivo .env no encontrado.${NC}"
  echo -e "${BLUE}Creando .env vacío...${NC}"
  touch .env
fi


# Instalar dependencias
(pip install -r src/app/api/requirements.txt > /dev/null 2>&1) &
show_loader $! && echo -e "${GREEN}Dependencias de Python listas.${NC}"

(pnpm install > /dev/null 2>&1) &
show_loader $! && echo -e "${GREEN}Dependencias de PNPM listas.${NC}"

export PYTHONPATH=$(pwd)/src

# Levantar backend
uvicorn src.app.api.main:app --host 0.0.0.0 --port 8000 --reload &
SERVER_PYTHON_PID=$!
sleep 2

# pnpm build si es start
if [[ "$MODE" == "start" ]]; then
  (pnpm run build > /dev/null 2>&1) &
  show_loader $! && echo -e "${GREEN}Build completado.${NC}"
fi

# Levantar frontend
pnpm $MODE &
SERVER_FRONTEND_PID=$!
sleep 2

# Menú
ACTUAL_MODE="$( [[ "$MODE" == "start" ]] && echo "Producción" || echo "Desarrollo" )"
function install_dependencies() {
  echo -e "\n${YELLOW}[P] pip  [N] pnpm  [Q] Cancelar${NC}"
  read -n 1 -s dep_type
  case $dep_type in
    p|P)
      echo -e "\n${YELLOW}Nombre pip:${NC}"; read dep_name
      pip install "$dep_name" && restart_all_processes;;
    n|N)
      echo -e "\n${YELLOW}Nombre pnpm:${NC}"; read dep_name
      pnpm add "$dep_name" && restart_all_processes;;
    *) echo -e "\n${YELLOW}Cancelado.${NC}";;
  esac
}

function show_options() {
  echo -e "\n${YELLOW}Modo $ACTUAL_MODE:${NC}"
  echo -e "${BLUE}[O] VSCode  [F] Frontend  [B] Backend  [I] Instalar deps  [R] Reiniciar  [Q] Salir${NC}"
}

show_options

while true; do
  read -n 1 -s key
  case $key in
    o|O) command -v code >/dev/null && code . &;;
    f|F) open_url "http://localhost:3000";;
    b|B) open_url "http://localhost:8000/docs";;
    i|I) install_dependencies;;
    r|R) restart_all_processes;;
    q|Q) kill_all_processes;;
    *) echo -e "\n${YELLOW}Opción inválida.${NC}";;
  esac
  show_options
done
