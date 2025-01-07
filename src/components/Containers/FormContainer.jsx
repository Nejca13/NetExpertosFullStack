'use client'
import styles from './FormContainer.module.css'

const FormContainer = ({ children, onSubmit, method }) => {
  return (
    <section className={styles.section}>
      <form
        className={styles.form}
        autoComplete='off'
        onSubmit={onSubmit}
        method={method}
      >
        {children}
      </form>
    </section>
  )
}

export default FormContainer
