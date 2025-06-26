'use client'
import { useState } from 'react'
import styles from './page.module.css'
import ButtonBack from '@/components/VerifyUser/ButtonBack/ButtonBack'
import StepOne from '@/components/VerifyUser/Steps/StepOne'
import StepTwo from '@/components/VerifyUser/Steps/StepTwo'
import StepThree from '@/components/VerifyUser/Steps/StepThree'
import StepFour from '@/components/VerifyUser/Steps/StepFour'

const VerifyUserPage = () => {
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState({
    front: null,
    back: null,
    video: null,
  })

  console.log('📦 Archivos cargados:', {
    Frente: files.front,
    Dorso: files.back,
    Video: files.video,
  })

  return (
    <div className={styles.container}>
      <ButtonBack />
      <div className={styles.move_container}>
        <div
          className={styles.steps_wrapper}
          style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
        >
          <div
            className={`${styles.step} ${
              step === 1 ? styles.active : step > 1 ? styles.prev : ''
            }`}
          >
            <StepOne setStep={setStep} />
          </div>
          <div
            className={`${styles.step} ${
              step === 2 ? styles.active : step > 2 ? styles.prev : ''
            }`}
          >
            <StepTwo setStep={setStep} files={files} setFiles={setFiles} />
          </div>
          <div
            className={`${styles.step} ${
              step === 3 ? styles.active : step > 3 ? styles.prev : ''
            }`}
          >
            <StepThree setStep={setStep} files={files} setFiles={setFiles} />
          </div>
          <div className={`${styles.step} ${step === 4 ? styles.active : ''}`}>
            <StepFour setStep={setStep} files={files} setFiles={setFiles} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyUserPage
