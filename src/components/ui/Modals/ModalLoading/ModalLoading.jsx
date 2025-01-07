import SimpleLoader from '@/components/Loaders/SimpleLoader'
import styles from './ModalLoading.module.css'

const ModalLoading = ({ message }) => {
  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <SimpleLoader />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  )
}

export default ModalLoading
