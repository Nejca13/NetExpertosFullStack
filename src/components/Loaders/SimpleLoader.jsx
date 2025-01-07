import styles from './SimpleLoader.module.css'

const SimpleLoader = () => {
  return (
    <div>
      <div className={styles.threeBody}>
        <div className={styles.threeBody__dot}></div>
        <div className={styles.threeBody__dot}></div>
        <div className={styles.threeBody__dot}></div>
      </div>
    </div>
  )
}

export default SimpleLoader
