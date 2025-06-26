import Button from '@/components/Buttons/Button/Button'
import styles from './StyleSteps.module.css'

const StepOne = ({ setStep }) => {
  return (
    <div className={styles.step_container}>
      <h2>¡Bienvenido!</h2>
      <div className={styles.info_steps}>
        <span className={styles.description}>
          Para verificar su identidad, siga estos pasos:
        </span>
        <ul>
          <li>1. Sube una foto del frente de tu DNI</li>
          <li>2. Sube una foto del reverso de tu DNI</li>
          <li>
            3. Graba un video corto de tu rostro para confirmar que coincide con
            tu foto de identificación.
          </li>
        </ul>
        <small>
          Una vez que todo esté completado, toque el botón{' '}
          <strong>'Confirmar'</strong> para finalizar el proceso de
          verificación.
        </small>
      </div>
      <div className={styles.button_container}>
        <Button func={() => setStep(2)} text={'Empezar'} />
      </div>
    </div>
  )
}

export default StepOne
