const separarDatos = async (formData) => {
  const separatedData = {
    fotos_trabajos: [], // Inicializa un array para almacenar los trabajos realizados
  }
  // Agrupar datos por número de índice
  Object.entries(formData).forEach(([key, value]) => {
    const match = key.match(/trabajos_realizados_[a-zA-Z]+(?:_base64)?_(\d+)/)
    if (match) {
      const index = match[1]
      if (!separatedData.fotos_trabajos[index]) {
        // Si aún no hay un objeto para este índice, inicialízalo
        separatedData.fotos_trabajos[index] = {}
      }
      const fieldName = key.replace(`trabajos_realizados_`, '').split('_')[0]
      // Almacena los datos dentro del objeto correspondiente en fotos_trabajos
      if (fieldName === 'imagen') {
        separatedData.fotos_trabajos[index]['imagen_base64'] = value
      } else {
        separatedData.fotos_trabajos[index][fieldName] = value
      }
    } else {
      // Si no hay coincidencia con el patrón de clave esperado, mantén la data sin cambios
      separatedData[key] = value
    }
  })

  // Filtrar el array para eliminar posibles valores vacíos
  separatedData.fotos_trabajos = separatedData.fotos_trabajos.filter(Boolean)

  // Convertir las imágenes a base64
  await Promise.all(
    separatedData.fotos_trabajos.map(async (item) => {
      const fotoProp = Object.keys(item).find((key) =>
        key.startsWith('imagen_base64')
      )

      if (fotoProp && item[fotoProp] instanceof File) {
        const reader = new FileReader()
        reader.readAsDataURL(item[fotoProp])
        await new Promise((resolve) => {
          reader.onload = () => {
            // Actualizar el valor de la propiedad con el resultado base64
            item[fotoProp] = reader.result
            resolve()
          }
        })
      }
    })
  )

  return separatedData
}

export default separarDatos
