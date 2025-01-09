import styles from './Container.module.css'

const Container = ({ children, justifyContent }) => {
  // Solicitar el uso de la API de geolocalización
  const useGeolocation = () => {
    const storedLocation = JSON.parse(localStorage.getItem('userLocation'))
    if (storedLocation) {
      return
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('seteando nueva ubicacion')
          const { latitude, longitude } = position.coords
          const newLocation = { latitude, longitude }
          localStorage.setItem('userLocation', JSON.stringify(newLocation))
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      )
    }
  }
  return (
    <main
      onClick={useGeolocation}
      onTouchStart={useGeolocation}
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
