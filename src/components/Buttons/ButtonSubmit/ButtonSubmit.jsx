'use client'
import styles from './Button.module.css'

const ButtonSubmit = ({ text, backgroundColor, textColor }) => {
  return (
    <input
      style={{ backgroundColor: backgroundColor, color: textColor }}
      type='submit'
      value={text}
      className={styles.button}
    />
  )
}

export default ButtonSubmit
