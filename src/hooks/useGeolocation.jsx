import { useState, useEffect } from 'react'

function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const storedLocation = JSON.parse(localStorage.getItem('userLocation'))
    console.log('Ubicación almacenada:', storedLocation)

    if (storedLocation) {
      setLocation(storedLocation)
    }

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        console.error('Geolocalización no está soportada por este navegador.')
        setError('Geolocalización no soportada')
        return
      }

      console.log('Solicitando ubicación actual...')

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Ubicación obtenida:', position)
          const { latitude, longitude } = position.coords
          const newLocation = { latitude, longitude }

          if (
            !storedLocation ||
            storedLocation.latitude !== newLocation.latitude ||
            storedLocation.longitude !== newLocation.longitude
          ) {
            console.log('Seteando nueva ubicación:', newLocation)
            setLocation(newLocation)
            localStorage.setItem('userLocation', JSON.stringify(newLocation))
          } else {
            console.log('Ubicación ya guardada, no se actualiza')
          }
        },
        (error) => {
          console.error('Error al obtener ubicación:', error)
          setError(error.message)
          alert('No se pudo obtener tu ubicación actual.')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    }

    // Verificar permisos antes (opcional)
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('Estado del permiso de geolocalización:', result.state)
      })
    }

    getCurrentLocation()
  }, [])

  return { location, error }
}

export default useGeolocation
