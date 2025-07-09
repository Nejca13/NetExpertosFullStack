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
    // const mailEncode = encodeURIComponent(user.correo.trim())

    const response = await fetch(API_URL, {
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

// Obtener un profesional por id
export const getProfessionalById = async (id) => {
  try {
    const response = await fetch(API_URL + `get-profesional-by-id/${id}`)
    if (!response.ok) {
      const error = await response.json()
      console.log(error)
      throw new Error('Error en la solicitud')
    }
    const result = await response.json()
    return result
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getProfesionalesDashboard = async ({
  page = 1,
  limit = 25,
  sort_type = 'desc',
  query = null,
  numero = null,
  rubro_nombre = null,
  profesion_nombre = null,
  ubicacion = null,
  plus = null,
  min_calificacion = null,
  max_calificacion = null,
  min_recomendaciones = null,
  max_recomendaciones = null,
  from_date = null,
  to_date = null,
}) => {
  const searchParams = new URLSearchParams()

  if (page) searchParams.append('page', page.toString())
  if (limit) searchParams.append('limit', limit.toString())
  if (sort_type) searchParams.append('sort_type', sort_type)
  if (query) searchParams.append('query', query)
  if (numero) searchParams.append('numero', numero)
  if (rubro_nombre) searchParams.append('rubro_nombre', rubro_nombre)
  if (profesion_nombre)
    searchParams.append('profesion_nombre', profesion_nombre)
  if (ubicacion) searchParams.append('ubicacion', ubicacion)
  if (plus) searchParams.append('plus', plus)
  if (min_calificacion)
    searchParams.append('min_calificacion', min_calificacion)
  if (max_calificacion)
    searchParams.append('max_calificacion', max_calificacion)
  if (min_recomendaciones)
    searchParams.append('min_recomendaciones', min_recomendaciones)
  if (max_recomendaciones)
    searchParams.append('max_recomendaciones', max_recomendaciones)
  if (from_date) searchParams.append('from_date', from_date)
  if (to_date) searchParams.append('to_date', to_date)

  const url = `${API_URL}/dashboard?${searchParams.toString()}`

  try {
    const response = await fetch(url, { method: 'GET' })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al obtener los profesionales:', error)
      return {
        success: false,
        error: error.detail || 'Error desconocido',
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error de red:', error)
    return {
      success: false,
      error,
    }
  }
}
