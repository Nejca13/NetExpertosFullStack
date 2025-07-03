const API_URL = '/api/reviews'

export const getReviewsProfesional = async ({
  id_profesional,
  page = 1,
  limit = 10,
  ordenar_por = null,
  orden = 'desc',
}) => {
  if (!id_profesional) {
    console.error(' id_profesional es requerido.')
    return {
      success: false,
      error: 'El id del profesional es requerido.',
    }
  }

  const searchParams = new URLSearchParams()
  if (page) searchParams.append('page', page.toString())
  if (limit) searchParams.append('limit', limit.toString())
  if (ordenar_por) searchParams.append('ordenar_por', ordenar_por)
  if (orden) searchParams.append('orden', orden)

  const url = `${API_URL}/${id_profesional}/?${searchParams.toString()}`

  try {
    const response = await fetch(url, { method: 'GET' })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al obtener las reseñas:', error)
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
      error: 'Error de red o servidor no disponible',
    }
  }
}
