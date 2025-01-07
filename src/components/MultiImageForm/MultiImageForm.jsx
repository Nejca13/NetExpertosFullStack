import { useEffect, useState } from 'react'
import Image from 'next/image'
import { saveCompressedImageToLocalStorage } from '@/utils/minificadorDeImagenes'
import styles from './MultiImageForm.module.css'
import cameraImage from '@/assets/images/Camera.png'

const MultiImageForm = ({ index, trabajos }) => {
  const [image, setImage] = useState(null)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0] // Solo tomamos el primer archivo seleccionado
    if (file) {
      saveCompressedImageToLocalStorage(file, (compressedImage) => {
        setImage(compressedImage)
      })
    }
  }

  useEffect(() => {
    if (trabajos) {
      setImage(trabajos[0].imagen_base64)
    }
  }, [])

  return (
    <div name={index} className={styles.container}>
      <label
        htmlFor={`trabajos_realizados_imagen_base64_${index}`}
        className={styles.inputFileLabel}
      >
        {image ? (
          <Image
            className={styles.imagen}
            src={image}
            width={256}
            height={144}
            alt='Imagen de trabajos del usuario'
          />
        ) : (
          <div className={styles.defaultContainer}>
            <Image
              src={cameraImage}
              width={128}
              height={95}
              alt='Imagen camara de fotos'
            />
            <p className={styles.p}>Carga una imagen</p>
          </div>
        )}
        <input
          className={styles.inputFile}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          name={`trabajos_realizados_imagen_base64_${index}`}
          id={`trabajos_realizados_imagen_base64_${index}`}
          required
          onInvalid={(e) => {
            setError(true)
            setErrorMessage(e.target.validationMessage)
          }}
          onInput={(e) => setError(false)}
        />
      </label>
      {error ? <p className={styles.errorMessage}>{errorMessage}</p> : <p></p>}
      <div className={styles.inputContainer}>
        <input
          maxLength={32}
          className={styles.input}
          required
          type='text'
          name={`trabajos_realizados_titulo_${index}`}
          id={`trabajos_realizados_titulo_${index}`}
          placeholder='Titulo'
        />
        <input
          maxLength={32}
          required
          className={styles.input}
          type='text'
          name={`trabajos_realizados_lugar_${index}`}
          id={`trabajos_realizados_lugar_${index}`}
          placeholder='Lugar'
        />
        <input
          maxLength={32}
          required
          className={styles.input}
          type='date'
          name={`trabajos_realizados_fecha_${index}`}
          id={`trabajos_realizados_fecha_${index}`}
          placeholder='Fecha'
        />
      </div>
    </div>
  )
}

export default MultiImageForm
