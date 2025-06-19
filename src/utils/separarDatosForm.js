const separarDatos = (formData) => {
  const separatedData = {
    fotos_trabajos: [], // Array para almacenar los trabajos
  }
  // Recorrer cada par clave-valor del objeto formData
  Object.entries(formData).forEach(([key, value]) => {
    const match = key.match(/trabajos_realizados_[a-zA-Z]+(?:_base64)?_(\d+)/)
    if (match) {
      const index = Number(match[1])
      if (!separatedData.fotos_trabajos[index]) {
        separatedData.fotos_trabajos[index] = {}
      }
      // Extraer el nombre del campo (antes del último guión bajo)
      const fieldName = key.replace(/^trabajos_realizados_/, '').split('_')[0]
      if (fieldName === 'imagen') {
        // Conservamos el File directamente
        separatedData.fotos_trabajos[index]['foto'] = value
      } else {
        separatedData.fotos_trabajos[index][fieldName] = value
      }
    } else {
      separatedData[key] = value
    }
  })

  // Eliminar índices vacíos
  separatedData.fotos_trabajos = separatedData.fotos_trabajos.filter(Boolean)
  console.log(separatedData)
  return separatedData
}

export default separarDatos
