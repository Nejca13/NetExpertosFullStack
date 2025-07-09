export const saveCompressedImageToLocalStorage = async (file, callback) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.src = event.target.result
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const maxWidth = 512
      const maxHeight = 512

      let width = img.width
      let height = img.height

      // Redimensionar manteniendo proporción
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

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      const compressedBase64 = canvas.toDataURL('image/webp', 0.8)

      // Convertir base64 a blob y luego a File
      fetch(compressedBase64)
        .then((res) => res.blob())
        .then((blob) => {
          const webpFile = new File([blob], 'imagen_perfil.webp', {
            type: 'image/webp',
          })

          // Guardar en localStorage
          localStorage.setItem('imagen_perfil', compressedBase64)

          // Callback con base64 y file
          callback(compressedBase64, webpFile)
        })
    }
  }
  reader.readAsDataURL(file)
}
