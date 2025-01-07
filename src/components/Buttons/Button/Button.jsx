import styles from './Button.module.css'

const Button = ({ text, func, disabled, backgroundColor, textColor }) => {
  return (
    <button
      style={{ backgroundColor: backgroundColor, color: textColor }}
      className={styles.button}
      onClick={func}
      disabled={disabled ? disabled : false}
    >
      {text}
    </button>
  )
}

export default Button
