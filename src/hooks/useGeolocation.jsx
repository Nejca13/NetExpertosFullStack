import { useState, useEffect } from 'react'

function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const storedLocation = JSON.parse(localStorage.getItem('userLocation'))
    if (storedLocation) {
      setLocation(storedLocation)
    }
    const getCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('seteando nueva ubicacion')
          const { latitude, longitude } = position.coords
          const newLocation = { latitude, longitude }

          if (
            !storedLocation ||
            storedLocation.latitude !== newLocation.latitude ||
            storedLocation.longitude !== newLocation.longitude
          ) {
            setLocation(newLocation)
          } else {
            return
          }

          // Guardar la nueva ubicación en el localStorage
          localStorage.setItem('userLocation', JSON.stringify(newLocation))
        },
        (error) => {
          setError(error.message)
          alert(
            'Obtener la ubicación actual es necesario para el correcto funcionamiento de la aplicación!'
          )
        }
      )
    }

    getCurrentLocation()
  }, [])

  return { location, error }
}

export default useGeolocation
