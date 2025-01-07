import { clearUsers } from '@/utils/indexedDataBase'

const API_URL = '/api/users-form/'

/**
 * Realiza el proceso de inicio de sesión de un usuario.
 * @param {Object} loginData - Datos de inicio de sesión del usuario.
 * @param {string} loginData.username - Nombre de usuario.
 * @param {string} loginData.password - Contraseña del usuario.
 */
export const userLogin = async (
  loginData,
  setErrorMessage,
  setIsLoading,
  setLoadingMessage
) => {
  try {
    // Construir los datos del formulario para la solicitud de inicio de sesión
    const formData = new URLSearchParams()
    formData.append('username', loginData.username)
    formData.append('password', loginData.password)

    // Configuración de la solicitud de inicio de sesión
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    }

    // Realizar la solicitud de inicio de sesión
    const loginResponse = await fetch(API_URL + 'login/', requestOptions)

    if (!loginResponse.ok) {
      // Si la respuesta no es exitosa, lanzar un error con el detalle del error
      const errorData = await loginResponse.json()
      console.error(errorData.detail)
      setIsLoading(false)
      setErrorMessage(errorData.detail)
      throw new Error('Error al iniciar sesión')
    }

    // Si la solicitud es exitosa, devolver los datos
    const data = await loginResponse.json()
    return data
  } catch (error) {
    // Manejar cualquier error ocurrido durante el proceso

    return error //  Relanzar el error para que sea manejado en el contexto superior si es necesario
  }
}

export const userLogout = async () => {
  try {
    clearUsers()
    window.location.href = '/' // Cambia '/login' según la ruta adecuada
  } catch (error) {
    // Manejar cualquier error ocurrido durante el proceso
    console.error('Error:', error.message)
  }
}

export const verifyClientsCode = async (data) => {
  const formData = new URLSearchParams()
  formData.append('correo', data.username)
  formData.append('otp', data.otp)
  try {
    const response = await fetch('/api/clientes/verify-otp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })
    if (response.ok) {
      // const data = await response.json()
      return true
    } else {
      const error = await response.json()
      console.log(error.detail)
      throw error
    }
  } catch (error) {
    console.error('Error en la verificación del código:', error)
    throw error
  }
}
