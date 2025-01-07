import styles from './Container.module.css'

const Container = ({ children, justifyContent }) => {
  return (
    <main
      style={
        justifyContent && {
          justifyContent: justifyContent,
        }
      }
      className={styles.main}
    >
      {children}
    </main>
  )
}

export default Container
