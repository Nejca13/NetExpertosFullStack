import Image from 'next/image'
import styles from './ModalError.module.css'
import crossBlanca from '@/assets/images/cross-blanca.png'
const ModalError = ({ setShowModalError, errorMessage }) => {
  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <button
          className={styles.button}
          onClick={() => setShowModalError(false)}
        >
          <Image
            src={crossBlanca}
            width={20}
            height={20}
            alt='boton de cerrar'
          />
        </button>
        {errorMessage ? (
          <p className={styles.p}>{errorMessage}</p>
        ) : (
          <p className={styles.p}>Ocurrio un error inesperado</p>
        )}
      </div>
    </div>
  )
}

export default ModalError
