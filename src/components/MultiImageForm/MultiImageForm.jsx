import { useEffect, useState } from 'react'
import Image from 'next/image'
import styles from './MultiImageForm.module.css'
import cameraImage from '@/assets/images/Camera.png'
import { compressImageFile } from '@/utils/imageUtils'

const MultiImageForm = ({ index, trabajos }) => {
  const trabajo = trabajos?.[index]

  const [image, setImage] = useState(trabajo?.foto || null)
  const [titulo, setTitulo] = useState(trabajo?.titulo || '')
  const [lugar, setLugar] = useState(trabajo?.lugar || '')
  const [fecha, setFecha] = useState(trabajo?.fecha || '')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImageFile(file, 800, 'image/webp', 0.6)
      setImage(URL.createObjectURL(compressed))
    } catch (err) {
      console.error('Error al comprimir imagen:', err)
    }
  }

  return (
    <div name={index} className={styles.container}>
      <label
        htmlFor={`trabajos_realizados_foto_${index}`}
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
          name={`trabajos_realizados_foto_${index}`}
          id={`trabajos_realizados_foto_${index}`}
          onInvalid={(e) => {
            setError(true)
            setErrorMessage(e.target.validationMessage)
          }}
          onInput={() => setError(false)}
          required={!trabajo?.foto && true}
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
          placeholder='Título'
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <input
          maxLength={32}
          required
          className={styles.input}
          type='text'
          name={`trabajos_realizados_lugar_${index}`}
          id={`trabajos_realizados_lugar_${index}`}
          placeholder='Lugar'
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
        />
        <input
          required
          className={styles.input}
          type='date'
          name={`trabajos_realizados_fecha_${index}`}
          id={`trabajos_realizados_fecha_${index}`}
          placeholder='Fecha'
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>
    </div>
  )
}

export default MultiImageForm
