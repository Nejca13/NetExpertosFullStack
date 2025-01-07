export const verifyProfesionalCode = async (data) => {
  const formData = new URLSearchParams()
  formData.append('correo', data.username)
  formData.append('otp', data.otp)
  try {
    const response = await fetch('/api/profesionales/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (response.ok) {
      const data = await response.json()
      return true
    } else {
      const error = await response.json()
      console.log(error.detail)
      throw error
    }
  } catch (error) {
    console.error('Error en la verificación del código profesional:', error)
    throw error
  }
}
