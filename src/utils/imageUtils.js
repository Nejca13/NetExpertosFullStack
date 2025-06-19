// src/utils/imageUtils.js

/**
 * Comprime y redimensiona una imagen File.
 * @param {File} file        Archivo original.
 * @param {number} maxWidth  Ancho máximo deseado (mantiene proporción).
 * @param {string} mimeType  'image/webp' o 'image/jpeg'.
 * @param {number} quality   Calidad entre 0 y 1.
 * @returns {Promise<File>}  Promesa que resuelve con el File comprimido.
 */
export function compressImageFile(
  file,
  maxWidth = 800,
  mimeType = 'image/webp',
  quality = 0.6
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = maxWidth / img.width
        const canvas = document.createElement('canvas')
        canvas.width = maxWidth
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Error al crear blob'))
            const compressedFile = new File([blob], file.name, {
              type: blob.type,
            })
            resolve(compressedFile)
          },
          mimeType,
          quality
        )
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
