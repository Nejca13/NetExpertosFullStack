import { createPortal } from 'react-dom'
import styles from './Modal.module.css'
import cross from '@/assets/images/cross-blanca.png'
import Image from 'next/image'

const Modal = ({ isModalOpen, onClose, children, maxWidth = '500px' }) => {
  if (!isModalOpen) return null
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <button className={styles.closeButton} onClick={onClose}>
        <Image width={18} height={18} src={cross} alt='boton cerrar' />
      </button>
      <div className={styles.modal} style={{ maxWidth: maxWidth }}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal
