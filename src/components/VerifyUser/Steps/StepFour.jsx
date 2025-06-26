'use client'

import { useEffect, useState } from 'react'
import UploadIcon from '@/assets/icon/UploadIcon'
import styles from './StyleSteps.module.css'
import Button from '@/components/Buttons/Button/Button'

const StepFour = ({ setStep, files, setFiles }) => {
  const [thumbnail, setThumbnail] = useState(null)
  const [error, setError] = useState(null)
  const nextStep = () => {
    if (!files.video) {
      setError('Por favor, sube un video antes de avanzar.')
      return
    }
    setError(null)
  }
  useEffect(() => {
    if (!files.video) return

    const video = document.createElement('video')
    video.src = URL.createObjectURL(files.video)
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true

    video.addEventListener('loadeddata', () => {
      // Espera un frame
      video.currentTime = 0.5
    })

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageUrl = canvas.toDataURL('image/png')
      setThumbnail(imageUrl)

      // Liberar la URL temporal
      URL.revokeObjectURL(video.src)
    })
  }, [files.video])

  return (
    <div className={styles.step_container}>
      <h3 style={{ lineHeight: '27px' }}>Vídeo de verificación facial</h3>
      <div className={styles.info_steps}>
        <span className={styles.description}>
          Graba un video corto de tu rostro para confirmar que coincide con tu
          foto de identificación.
        </span>

        <label htmlFor='video-upload'>
          <input
            type='file'
            id='video-upload'
            name='video-upload'
            accept='video/*'
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0]
              if (file && file.type.startsWith('video/')) {
                setFiles({ ...files, video: file })
              } else {
                alert('Solo se permiten archivos de video')
              }
            }}
            required
          />

          {thumbnail ? (
            <div className={styles.file_info}>
              <img
                src={thumbnail}
                alt='Vista previa del video'
                width={160}
                height={90}
                style={{ borderRadius: '8px' }}
              />
            </div>
          ) : (
            <div className={styles.preview}>
              <span>
                <UploadIcon
                  width='24px'
                  height='24px'
                  color='rgb(37 99 235 )'
                />
              </span>
              <h3>Toque para cargar</h3>
              <p>MP4, MOV o similar</p>
            </div>
          )}
        </label>
      </div>

      <div className={styles.button_container}>
        <Button text={'Enviar'} func={nextStep} />
      </div>
      <div className={styles.button_container}>
        <Button
          text={'Volver'}
          func={() => {
            setStep(3)
            setError(null)
          }}
          backgroundColor={'#545454'}
        />
      </div>
      {error && <small className={styles.error_message}>{error}</small>}
    </div>
  )
}

export default StepFour
