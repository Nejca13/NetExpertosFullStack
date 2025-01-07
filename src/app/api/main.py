from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import clientes, profesionales, profesion, citas, chat, denuncias
from .security import auth_classic, auth_google
from .models.profesion import Profesion as profesion_model
from pymongo import MongoClient
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles


client = MongoClient("mongodb://127.0.0.1:27017")

db = client.test
profesiones_collection = db.profesiones


app = FastAPI()

# Configuración de CORS para permitir peticiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir peticiones desde cualquier origen
    allow_credentials=True,  # Permitir el uso de credenciales (cookies, tokens de autenticación)
    allow_methods=[
        "*"
    ],  # Permitir todos los métodos HTTP (GET, POST, PUT, DELETE, etc)
    allow_headers=["*"],  # Permitir todos los encabezados en las solicitudes
)
app.add_middleware(SessionMiddleware, secret_key="netexpertos")

# rutas

app.include_router(clientes.router)
app.include_router(profesionales.router)
app.include_router(profesion.router)
app.include_router(auth_classic.router)
app.include_router(auth_google.router)
app.include_router(citas.router)
app.include_router(chat.router)
app.include_router(denuncias.router)


app.mount("/static", StaticFiles(directory="static"), name="static")


def crear_profesiones_default():
    profesiones_default = [
        (
            "Asesoramiento Contable y Legal",
            [
                "Abogados",
                "Contadores",
                "Despachantes de Aduana",
                "Gestores",
                "Productores de Seguros",
                "Tasadores",
                "Consultores Tributarios",
                "Auditores",
                "Otros",
            ],
        ),
        (
            "Belleza y Cuidado Personal",
            [
                "Cosmetólogos",
                "Esteticistas",
                "Manicuristas y Pedicuristas",
                "Maquilladores y Peinadores",
                "Terapeutas de Masaje",
                "Peluqueros",
                "Tatuadores y Especialistas en Piercings",
                "Nutricionistas",
                "Entrenadores Personales",
                "Otros",
            ],
        ),
        (
            "Comunicacion y Diseño",
            [
                "Diseñadores Gráficos",
                "Locutores",
                "Especialistas en Marketing y Publicidad",
                "Traductores",
                "Redactores",
                "Editores de Video",
                "Ilustradores",
                "Fotógrafos",
                "Animadores y Motion Graphics",
                "Otros",
            ],
        ),
        (
            "Cursos y Clases",
            [
                "Profesores de Apoyo Escolar y Universitario",
                "Instructores de Artes Plásticas",
                "Instructores de Canto y Baile",
                "Chefs e Instructores de Cocina",
                "Instructores de Computación e Informática",
                "Entrenadores Deportivos",
                "Instructores de Fotografía",
                "Profesores de Idiomas",
                "Instructores de Instrumentos Musicales",
                "Instructores de Manejo",
                "Maquilladores",
                "Instructores de Mecánica",
                "Instructores de Tatuajes",
                "Otros",
            ],
        ),
        (
            "Fiestas y Eventos",
            [
                "Animadores y Especialistas en Juegos",
                "Catering",
                "Decoradores y Ambientadores",
                "Personal Gastronómico",
                "Técnicos de Servicios Audiovisuales",
                "Organizadores de Eventos",
                "Coordinadores de Bodas",
                "Fotógrafos de Eventos",
                "Planificadores de Fiestas Temáticas",
                "Otros",
            ],
        ),
        (
            "Fotografia Musica y Cine",
            [
                "Cineastas y Directores de Cine",
                "Fotógrafos",
                "Músicos y Cantantes",
                "Editores de Video",
                "Productores Audiovisuales",
                "Directores de Fotografía",
                "Técnicos de Sonido",
                "Otros",
            ],
        ),
        (
            "Hogar y Construccion",
            [
                "Albañiles",
                "Carpinteros",
                "Cerrajeros",
                "Decoradores y Ambientadores de Interiores",
                "Electricistas",
                "Fumigadores",
                "Herreros",
                "Jardineros y Especialistas en Exteriores",
                "Servicios de Limpieza",
                "Pintores",
                "Instaladores de Pisos",
                "Técnicos de Aire Acondicionado",
                "Plomeros",
                "Gasistas",
                "Especialistas en Revestimientos",
                "Especialistas en Seguridad",
                "Ingenieros Civiles",
                "Arquitectos",
                "Paisajistas",
                "Otros",
            ],
        ),
        (
            "Servicios Automotor",
            [
                "Especialistas en Audio para Vehículos",
                "Cerrajeros de Autos",
                "Especialistas en Cuidado del Vehículo",
                "Técnicos de Diagnósticos Automotrices",
                "Especialistas en Llantas y Neumáticos",
                "Lubricentros",
                "Técnicos de Parabrisas y Cristales",
                "Especialistas en Seguridad Vehicular",
                "Mecánicos",
                "Electricistas de Autos",
                "Ingenieros Automotrices",
                "Diseñadores de Automóviles",
                "Chapistas",
                "Otros",
            ],
        ),
        (
            "Medicina y Salud",
            [
                "Acompañantes Terapéuticos",
                "Cirujanos Plásticos",
                "Enfermeros",
                "Geriatras",
                "Odontólogos",
                "Podólogos",
                "Psicólogos y Psicopedagogos",
                "Médicos Especialistas (Cardiólogos, Dermatólogos, etc.)",
                "Fisioterapeutas",
                "Nutricionistas",
                "Optometristas",
                "Otros",
            ],
        ),
        (
            "Ropa y Moda",
            [
                "Modistas y Arreglos",
                "Bordadores",
                "Confeccionistas",
                "Especialistas en Corte y Moldería",
                "Especialistas en Estampados",
                "Lavanderías y Tintorerías",
                "Diseñadores de Moda",
                "Estilistas",
                "Consultores de Imagen",
                "Otros",
            ],
        ),
        (
            "Servicios Para Mascotas",
            [
                "Adiestradores Caninos",
                "Cuidadores y Especialistas en Higiene",
                "Paseadores de Perros",
                "Peluqueros Caninos",
                "Encargados de Pensionados y Guarderías para Mascotas",
                "Veterinarios",
                "Entrenadores de Perros de Terapia",
                "Otros",
            ],
        ),
        (
            "Servicios Para Oficinas",
            [
                "Técnicos en Mantenimiento de Equipos de Oficina",
                "Técnicos de Equipos de Fitness",
                "Técnicos de Fotocopiadoras",
                "Técnicos de Montacargas y Ascensores",
                "Servicios de Limpieza",
                "Consultores de Productividad",
                "Otros",
            ],
        ),
        (
            "Tecnologia",
            [
                "Especialistas en Alarmas y Cámaras de Seguridad",
                "Técnicos de Audio y Video",
                "Técnicos en Celulares y Telefonía",
                "Técnicos en Computación",
                "Técnicos en Consolas",
                "Técnicos en Cámaras Digitales",
                "Técnicos en GPS",
                "Programadores",
                "Especialistas en Relojes",
                "Consultores de TI",
                "Técnicos en Redes",
                "Desarrolladores de Software",
                "Ingenieros de Sistemas",
                "Analistas de Datos",
                "Diseñadores UX/UI",
                "Especialistas en Ciberseguridad",
                "Otros",
            ],
        ),
        (
            "Transporte",
            [
                "Conductores Profesionales",
                "Empresas de Logística",
                "Mudanzas",
                "Transporte de Pasajeros",
                "Conductores de Remolques",
                "Otros",
            ],
        ),
        (
            "Viajes y Turismo",
            [
                "Agentes de Viajes",
                "Guías Turísticos",
                "Coordinadores de Tours",
                "Organizadores de Excursiones y Paseos",
                "Planificadores de Paquetes Turísticos",
                "Coordinadores de Asistencia al Viajero",
                "Otros",
            ],
        ),
        (
            "Educacion",
            [
                "Profesores de Primaria",
                "Profesores de Secundaria",
                "Profesores Universitarios",
                "Educadores Infantiles",
                "Pedagogos",
                "Tutores",
                "Otros",
            ],
        ),
        (
            "Gastronomia",
            [
                "Chefs",
                "Cocineros",
                "Pasteleros",
                "Panaderos",
                "Sommeliers",
                "Baristas",
                "Mixólogos",
                "Otros",
            ],
        ),
        (
            "Arte",
            [
                "Pintores",
                "Escultores",
                "Artistas Multimedia",
                "Artistas Digitales",
                "Otros",
            ],
        ),
        (
            "Deporte",
            [
                "Entrenadores Personales",
                "Preparadores Físicos",
                "Fisioterapeutas Deportivos",
                "Nutricionistas Deportivos",
                "Árbitros",
                "Instructores de Yoga y Pilates",
                "Otros",
            ],
        ),
        (
            "Finanzas",
            [
                "Contadores",
                "Analistas Financieros",
                "Asesores Financieros",
                "Gestores de Inversiones",
                "Economistas",
                "Otros",
            ],
        ),
        (
            "Medio Ambiente",
            [
                "Biólogos",
                "Ingenieros Ambientales",
                "Ecologistas",
                "Consultores Ambientales",
                "Geólogos",
                "Otros",
            ],
        ),
        (
            "Musica",
            [
                "Músicos",
                "Cantantes",
                "Productores Musicales",
                "Compositores",
                "DJs",
                "Otros",
            ],
        ),
        (
            "Marketing",
            [
                "Especialistas en SEO",
                "Especialistas en SEM",
                "Community Managers",
                "Analistas de Mercado",
                "Directores de Marketing",
                "Otros",
            ],
        ),
        (
            "Consultoria",
            [
                "Consultores de Negocios",
                "Consultores de Gestión",
                "Consultores de Tecnología",
                "Consultores Financieros",
                "Consultores de Recursos Humanos",
                "Otros",
            ],
        ),
        (
            "Recursos Humanos",
            [
                "Gestores de Talento",
                "Especialistas en Reclutamiento",
                "Analistas de Recursos Humanos",
                "Entrenadores de Desarrollo",
                "Responsables de Nóminas",
                "Otros",
            ],
        ),
        (
            "Investigacion",
            [
                "Investigadores Científicos",
                "Analistas de Datos",
                "Epidemiólogos",
                "Investigadores de Mercado",
                "Analistas de Inteligencia",
                "Otros",
            ],
        ),
    ]

    # Check if each default profession exists, if not, create it
    for profesion_titulo, roles in profesiones_default:
        if not profesiones_collection.find_one({"nombre": profesion_titulo}):
            descripcion = ", ".join(roles)
            nueva_profesion = profesion_model(
                nombre=profesion_titulo, descripcion=descripcion
            )
            profesiones_collection.insert_one(nueva_profesion.dict())


# Crear las profesiones por defecto al iniciar la aplicación
crear_profesiones_default()
