import styles from './Container.module.css'

const ContainerBlanco = ({ children }) => {
  return <main className={styles.mainFondoBlanco}>{children}</main>
}

export default ContainerBlanco
