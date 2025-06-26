'use client'
import styles from './page.module.css'
import ButtonBack from '@/components/VerifyUser/ButtonBack/ButtonBack'

const VerifyUserPage = () => {
  return (
    <div className={styles.container}>
      <ButtonBack />
      <div className={styles.content_steps}></div>
    </div>
  )
}

export default VerifyUserPage
