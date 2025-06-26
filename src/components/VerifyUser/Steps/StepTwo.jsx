'use client'

import UploadIcon from '@/assets/icon/UploadIcon'
import styles from './StyleSteps.module.css'
import Button from '@/components/Buttons/Button/Button'
import { useState } from 'react'
const StepTwo = ({ setStep, files, setFiles }) => {
  const [error, setError] = useState(null)

  const nextStep = () => {
    if (!files.front) {
      setError(
        'Por favor, sube una imagen del frente del documento antes de avanzar.'
      )
      return
    }
    setError(null)
    setStep(3)
  }

  return (
    <div className={styles.step_container}>
      <h3 style={{ lineHeight: '27px' }}>Frente del documento de identidad</h3>
      <div className={styles.info_steps}>
        <span className={styles.description}>
          Sube una foto clara del frente de tu identificación emitida por el
          gobierno
        </span>
        <label htmlFor='front-upload'>
          <input
            type='file'
            id='front-upload'
            name='front-upload'
            accept='image/jpeg,image/png,image/webp'
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                setFiles({ ...files, front: file })
              }
            }}
            required
          />

          {files?.front ? (
            <div className={styles.file_info}>
              <img
                src={URL.createObjectURL(files.front)}
                alt='Preview del frente del documento'
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
              <p>JPG, PNG o similar</p>
            </div>
          )}
        </label>
      </div>
      <div className={styles.button_container}>
        <Button text={'Siguiente'} func={nextStep} />
      </div>
      <div className={styles.button_container}>
        <Button
          text={'Volver'}
          func={() => {
            setStep(1)
            setError(null)
          }}
          backgroundColor={'#545454'}
        />
      </div>
      {error && <small className={styles.error_message}>{error}</small>}
    </div>
  )
}

export default StepTwo
