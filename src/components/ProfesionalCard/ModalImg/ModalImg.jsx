import styles from './ModalImg.module.css'
import { createPortal } from 'react-dom'
import cross from '@/assets/images/cross-blanca.png'
import Image from 'next/image'

const ModalImg = ({ image, setShowModalImg }) => {
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowModalImg(false)
    }
  }
  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <button
        className={styles.closeButton}
        onClick={() => setShowModalImg(false)}
      >
        <Image width={18} height={18} src={cross} alt='boton cerrar' />
      </button>
      <div className={styles.modal}>
        <Image
          src={image}
          width={300}
          height={200}
          quality={50}
          alt='trabajo-realizado'
        />
      </div>
    </div>,
    document.body
  )
}

export default ModalImg
