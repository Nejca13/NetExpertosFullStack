import { kilometros } from '@/constants/kilometros'
import { updateUser } from '@/utils/indexedDataBase'

const API_URL = '/api/profesionales/'

// Función para obtener todos los profesionales
export const getAllProfesionales = async () => {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error('Error en la solicitud')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Función para crear un nuevo profesional
export const createProfesional = async (
  data,
  setIsLoading,
  setErrorMessage
) => {
  const CREATE_PROFESIONAL_API_URL = '/api/profesionales/request-registration/'
  const [nombre, apellido] = data.nombre_apellido.split(' ')
  const newData = {
    rol: 'Profesional',
    nombre: nombre,
    apellido: apellido,
    numero: data.telefono,
    correo: data.correo,
    password: data.password,
    ubicacion: data.ubicacion,
    calificacion: 0,
    experiencia_laboral_años: data.experiencia_laboral_años
      ? parseInt(data.experiencia_laboral_años)
      : 0,
    recomendaciones: 0,
    fotos_trabajos: data.fotos_trabajos,
    foto_perfil: data.foto_perfil,
    horarios_atencion: `de ${data.horario_apertura} - a ${data.horario_cierre}`,
    nacimiento: data.nacimiento,
    rubro_nombre: data.rubro_nombre,
    profesion_nombre: data.profesion_nombre,
    acerca_de_mi: data.acerca_de_mi,
    fecha_registro: new Date().toISOString(), // Obtener la fecha actual en formato ISO
  }
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    }

    const response = await fetch(CREATE_PROFESIONAL_API_URL, options)

    if (response.ok) {
      console.log('Usuario creado exitosamente')
      return true
    } else {
      setIsLoading(false)
      const errorData = await response.json() // Captura el cuerpo de la respuesta si hay error
      setErrorMessage(errorData.detail)
      console.log(errorData)
      console.error(
        `Error en la solicitud: `,
        errorData // Imprime también los detalles del error si están disponibles
      )
    }
  } catch (error) {
    console.error('Error creando usuario:', error)
    setErrorMessage('Error al crear usuario')
  }
}

// Funcion para obtener profesionales filtrados por profesion y ordenados desde el mas cerca al mas lejos

export const getFilteredAndSortedProfessionalsByDistance = async (
  data,
  setErrorMessage
) => {
  try {
    const response = await fetch(
      API_URL +
        `cercanos/${data.profesion}?latitud=${data.latitud}&longitud=${
          data.longitud
        }&rango_km=${kilometros[data.kilometrosDeRadio]}&page=1&page_size=10`
    )
    if (!response.ok) {
      const error = await response.json()
      console.log(error)
      throw new Error('Error en la solicitud')
    }
    const result = await response.json()

    if (result.profesionales_cercanos.length === 0) {
      setErrorMessage(`No hay ${decodeURIComponent(data.profesion)} cerca`)
    } else {
      setErrorMessage(false)
    }
    return result
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateProfessional = async (user, updatedData) => {
  try {
    const mailEncode = encodeURIComponent(user.correo.trim())

    const response = await fetch(API_URL + `?correo=${mailEncode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    })

    if (response.ok) {
      // La solicitud fue exitosa
      const responseData = await response.json()

      // Actualizar el usuario en el IndexedDB <-- BORRAR DESPUES
      await updateUser(updatedData, user._id)

      window.location.reload()
      return responseData // Puedes retornar los datos actualizados si lo deseas
    } else {
      // La solicitud no fue exitosa
      const errorMessage = await response.text()
      throw new Error(`Error al actualizar los datos: ${errorMessage}`)
    }
  } catch (error) {
    // Error de red o cualquier otro error
    console.error('Ocurrió un error al realizar la solicitud:', error.message)
    throw error // Puedes lanzar el error nuevamente para que quien llame a esta función pueda manejarlo si es necesario
  }
}
