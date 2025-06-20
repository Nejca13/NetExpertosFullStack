'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../userContext'
import LogoNetExpertos from '@/components/ui/Logo/LogoNetExpertos'
import NavBar from '@/components/Navbar/NavBar'
import { useRouter } from 'next/navigation'
import ModalLoading from '@/components/ui/Modals/ModalLoading/ModalLoading'
import Container from '@/components/Containers/Container'
import { addUser } from '@/utils/indexedDataBase'
import ModalError from '@/components/ui/Modals/ModalError/ModalError'
import useStore from '@/store/store'

const Page = () => {
  const [auth, setAuth] = useAuth()
  const [authComponent, setAuthComponent] = useState(null)
  const router = useRouter()
  const [location, setLocation] = useState(null)

  //Zustand store
  const { currentUser, setCurrentUser } = useStore()

  useEffect(() => {
    const storedLocation = JSON.parse(localStorage.getItem('userLocation'))
    if (storedLocation) {
      setLocation(storedLocation)
    }
  }, [])

  const handleAuth = async (data) => {
    if (localStorage.getItem('userLocation')) {
      const userLocation = JSON.parse(localStorage.getItem('userLocation'))
      data.ubicacion = `${userLocation.latitude}, ${userLocation.longitude}`
    } else {
      console.log('No se pudo obtener la ubicacion /google-auth')
    }
    const response = await fetch('/api/auth-google/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const data = await response.json()
      const user = {
        token: data.token,
        user_data: data.user_data,
      }

      // IndexDB <--- BORRAR DESPUES
      await addUser(user)
        .then((result) => {
          console.log('Usuario guardado con ID:', result)
          router.push(`/profile/${user.user_data._id}`)
        })
        .catch((error) => {
          console.error('Error al guardar el usuario:', error)
        })

      //Zustand
      setCurrentUser(user)
      console.log('Guardando usuario en Zustand', currentUser)
    } else {
      const error = await response.json()
      console.error(error)
    }

    setAuthComponent(<ModalLoading message={'Cargando infomacion...'} />)
  }
  useEffect(() => {
    handleAuth(auth)
  }, [])

  return (
    <Container justifyContent={'flex-start'}>
      <NavBar onClick={() => router.back()} />

      <LogoNetExpertos width={200} />

      {location ? (
        <ModalLoading message={'Comprobando informacion ...'} />
      ) : (
        <ModalLoading message={'Obteniendo ubicacion actual...'} />
      )}
    </Container>
  )
}

export default Page
