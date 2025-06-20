import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

client = MongoClient("mongodb://127.0.0.1:27017")
db = client.netexpertos_db

# Collection references

CONVERSATIONS_COLLECTION = db.conversations
MESSAGES_COLLECTION = db.messages
PROFESIONES_COLLECTION = db.profesiones
CITAS_COLLECTION = db.citas
CLIENTES_COLLECTION = db.clientes
PROFESIONALES_COLLECTION = db.profesionales
TEMP_CLIENTES_COLLECTION = db.temp_clientes
TEMP_PROFESIONALES_COLLECTION = db.temp_profesionales
DENUNCIAS_COLLECTION = db.denuncias
