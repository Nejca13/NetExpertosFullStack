// FormUtils.js

import { updateCliente } from '@/services/api/clientes'
import { updateProfessional } from '@/services/api/profesionales'

export const handleSubmit = (e, user, newProfileImage) => {
  e.preventDefault()
  const formData = new FormData(e.target)

  // Extraer nombre y apellido
  const nombreApellido = formData.get('nombre_apellido').split(' ')
  const nombre = nombreApellido[0] || ''
  const apellido = nombreApellido[1] || ''
  formData.set('nombre', nombre)
  formData.set('apellido', apellido)
  formData.delete('nombre_apellido')

  // Comprobar y manejar la imagen de perfil
  if (
    typeof newProfileImage === 'string' &&
    newProfileImage.startsWith('data:image')
  ) {
    if (user.rol === 'Profesional') {
      formData.set('foto_perfil', newProfileImage)
    } else {
      formData.set('foto_base64', newProfileImage)
    }
  } else {
    formData.delete('foto_perfil')
    formData.delete('foto_base64')
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

  // Convertir FormData a objeto
  const data = Object.fromEntries(formData)
  if (user.rol === 'Profesional') {
    updateProfessional(user, data)
  }
  if (user.rol === 'Cliente') {
    updateCliente(user, data)
  }
}
