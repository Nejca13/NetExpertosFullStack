import { addUser, clearUsers, updateUser } from '@/utils/indexedDataBase'

const API_URL = '/api/clientes'
/**
 * Crea un nuevo usuario con los datos proporcionados.
 * @param {Object} data - Datos del usuario a crear.
 * @param {string} data.username - Nombre de usuario.
 * @param {string} data.password - Contraseña del usuario.
 */
export const createUser = async (data, setOnError, setLoading) => {
  setLoading('Esperando respuesta...')
  try {
    const options = {
      method: 'POST',

      body: data,
    }

    const response = await fetch(API_URL + '/request-registration/', options)
    if (response.ok) {
      const data = await response.json()
      console.log(data)
      setLoading('Enviando codigo de verifiación al correo')

      return true
    } else {
      setLoading(false)
      const errorData = await response.json() // Captura el cuerpo de la respuesta si hay error
      console.log(errorData)
      setOnError(errorData.detail)
    }
  } catch (error) {
    console.error('Error creando usuario:', error)
  }
}

/**
 * Obtiene información de cliente por su correo electrónico.
 * @param {string} correo - Correo electrónico del cliente.
 * @returns {Object} - Información del cliente.
 */
export const getClienteByEmail = async (correo) => {
  const queryParams = new URLSearchParams({ correo })

  try {
    const response = await fetch(`${API_URL}?${queryParams}`)
    if (!response.ok) {
      throw new Error('Error en la solicitud')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
  }
}

/**
 * Actualiza la información de un cliente por su ID.
 * @param {string} cliente_id - ID del cliente a actualizar.
 * @param {Object} data - Datos actualizados del cliente.
 * @returns {Object} - Datos actualizados del cliente.
 */
export const updateClienteById = async (cliente_id, data) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(`${API_URL}/${cliente_id}`, options)
    if (!response.ok) {
      throw new Error('Error en la solicitud')
    }
    return await response.json()
  } catch (error) {
    console.error('Error:', error)
  }
}

export const updateCliente = async (user, updatedData) => {
  try {
    const mailEncode = encodeURIComponent(user.correo)
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

export const converToProfesional = async (
  data,
  setIsLoading,
  setErrorMessage
) => {
  const newData = {
    rol: 'Profesional',
    nombre: data.nombre,
    apellido: data.apellido,
    numero: data.telefono,
    correo: data.correo,
    password: data.password,
    ubicacion: data.ubicacion,
    calificacion: 0,
    experiencia_laboral_años: parseInt(data.experiencia_laboral_años),
    recomendaciones: 0,
    fotos_trabajos: data.fotos_trabajos,
    foto_perfil: data.foto_perfil,
    horarios_atencion: `de ${data.horario_apertura} - a ${data.horario_cierre}`,
    nacimiento: data.nacimiento,
    rubro_nombre: data.rubro_nombre,
    profesion_nombre: data.profesion_nombre,
    acerca_de_mi: data.acerca_de_mi,
    fecha_registro: new Date().toISOString(),
  }
  setIsLoading(true)
  try {
    const response = await fetch(API_URL + '/convertir-a-profesional/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })

    if (response.ok) {
      const responseData = await response.json()
      if (responseData) {
        await clearUsers()
        await addUser(responseData)
        setIsLoading(false)
        window.location.reload()
        return true
      }
    } else {
      const errorData = await response.json()
      console.log(errorData)
      setErrorMessage(errorData.detail)
      setIsLoading(false)
      return false
    }
  } catch (error) {
    console.error('Error convirtiendo a profesional:', error)
    setErrorMessage('Error al cambiar de tipo de cuenta')
    setIsLoading(false)
    return false
  }
}
