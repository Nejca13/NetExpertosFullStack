// Función para comprimir y guardar una imagen en el localStorage
export const saveCompressedImageToLocalStorage = (file, callback) => {
  let imgData
  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.src = event.target.result
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Establecer el tamaño máximo de la imagen resultante
      const maxWidth = 200
      const maxHeight = 200
      let width = img.width
      let height = img.height

      // Redimensionar la imagen si es necesario
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        if (width > height) {
          width = maxWidth
          height = width / aspectRatio
        } else {
          height = maxHeight
          width = height * aspectRatio
        }
      }

      // Configurar el canvas con el nuevo tamaño
      canvas.width = width
      canvas.height = height

      // Dibujar la imagen en el canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Obtener la imagen comprimida en formato base64
      const compressedImageData = canvas.toDataURL('image/webp', 0.6) // Calidad de compresión (0.6 es una buena opción para imágenes web)

      // Calcular el tamaño del archivo original
      const originalSizeKB = Math.ceil(file.size / 1024)

      // Calcular el tamaño del archivo comprimido
      const compressedSizeKB = Math.ceil(
        (compressedImageData.length - (compressedImageData.indexOf(',') + 1)) /
          1024
      )

      /* // Mostrar el tamaño del archivo original y el tamaño después de la compresión en la consola
      console.log(`Tamaño del archivo original: ${originalSizeKB} KB`)
      console.log(`Tamaño del archivo comprimido: ${compressedSizeKB} KB`) */

      // Guardar la imagen comprimida en el localStorage
      localStorage.setItem(`imagen_perfil`, compressedImageData)
      callback(compressedImageData)
    }
  }
  reader.readAsDataURL(file)
}
