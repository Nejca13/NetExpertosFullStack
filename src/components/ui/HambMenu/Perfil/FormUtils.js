'use client'
import { updateCliente } from '@/services/api/clientes'
import { updateProfessional } from '@/services/api/profesionales'

export const handleSubmit = async (
  e,
  user,
  newProfileImage,
  setCurrentUser,
  currentUser
) => {
  e.preventDefault()
  const formData = new FormData(e.target)

  // Extraer nombre y apellido
  const nombreApellido = formData.get('nombre_apellido').split(' ')
  const nombre = nombreApellido[0] || ''
  const apellido = nombreApellido[1] || ''
  formData.set('nombre', nombre)
  formData.set('apellido', apellido)
  formData.delete('nombre_apellido')

  if (newProfileImage instanceof File) {
    console.log('LA IMAGEN ENVIADA ES UN ARCHIVO')
    formData.set('foto_perfil', newProfileImage)
  } else {
    formData.delete('foto_perfil')
  }

  // Crear el string de horarios de atención
  if (user.rol === 'Profesional') {
    const horarioApertura = formData.get('horarios_apertura') || ''
    const horarioCierre = formData.get('horarios_cierre') || ''
    const horariosAtencion = `de ${horarioApertura} - a ${horarioCierre}`
    formData.set('horarios_atencion', horariosAtencion)
    formData.delete('horarios_apertura')
    formData.delete('horarios_cierre')
  }

  //enviamos el email
  formData.set('correo', user.correo.trim())

  // Convertir FormData a objeto
  const data = Object.fromEntries(formData)
  console.log(data)
  if (user.rol === 'Profesional') {
    try {
      const res = await updateProfessional(user, formData)
      if (res.success) {
        setCurrentUser({
          token: currentUser.token,
          user_data: res.data,
        })
        return { success: true }
      } else {
        console.error('Error al actualizar')
        return { success: false }
      }
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  }
  if (user.rol === 'Cliente') {
    updateCliente(user, data)
  }
}
