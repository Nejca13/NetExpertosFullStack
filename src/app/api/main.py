from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.core import PROFESIONES_COLLECTION
from app.api.utils.helper_create_profesions import crear_profesiones_default
from .routers import clientes, profesionales, profesion, citas, chat, denuncias, fmc
from .security import auth_classic, auth_google
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key="netexpertos")

app.include_router(clientes.router)
app.include_router(profesionales.router)
app.include_router(chat.router)
app.include_router(citas.router)
app.include_router(denuncias.router)

app.include_router(profesion.router)
app.include_router(fmc.router)

app.include_router(auth_google.router)
app.include_router(auth_classic.router)

app.mount("/media", StaticFiles(directory="media"), name="media")


if PROFESIONES_COLLECTION.count_documents({}) == 0:
    crear_profesiones_default()
