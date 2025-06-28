'use client'

import Link from 'next/link'
import styles from './page.module.css'
import { Inputs } from '@/components/FormComponents/FormComponents'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import FormContainer from '@/components/Containers/FormContainer'
import { userLogin } from '@/services/api/authUsuarios'
import Container from '@/components/Containers/Container'
import LogoNetExpertos from '@/components/ui/Logo/LogoNetExpertos'
import { useEffect, useState } from 'react'
import ModalError from '@/components/ui/Modals/ModalError/ModalError'
import { useRouter } from 'next/navigation'
import { addUser, clearUsers, getFirstUser } from '@/utils/indexedDataBase'
import ModalLoading from '@/components/ui/Modals/ModalLoading/ModalLoading'
import dynamic from 'next/dynamic'
import useStore from '@/store/store'
import useGeolocation from '@/hooks/useGeolocation'

const ButtonSignInWithGoogle = dynamic(
  () =>
    import(
      '../components/Buttons/ButtonSignInWithGoogle/ButtonSignInWithGoogle'
    ),
  { ssr: false }
)

export default function Home() {
  const [showModalError, setShowModalError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { location, error } = useGeolocation()
  const [loadingMessage, setLoadingMessage] = useState(
    'Buscando sesiones activas...'
  )
  //Zustand store
  const { currentUser, setCurrentUser } = useStore()

  const router = useRouter()

  //IndexDB <---- CHEQUEAR PRIMERO PERO BORRAR DESPUES
  const ifUser = async () => {
    const user = currentUser
    if (user && user.user_data) {
      setIsLoading(false)
      router.push(`/profile/${user.user_data._id}`)
    } else {
      setIsLoading(false)
      return user
    }
  }

  useEffect(() => {
    console.log(location)
    console.log(error)
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formDataValues = Object.fromEntries(new FormData(e.target))
    try {
      setLoadingMessage('Iniciando sesion...')
      setIsLoading(true)
      clearUsers() // IndexDB <---- BORRAR DESPUES
      const data = await userLogin(
        formDataValues,
        setErrorMessage,
        setIsLoading,
        setLoadingMessage
      )
      if (data.error) {
        setErrorMessage(data.error.message)
      }
      if (data.user_data) {
        // IndexDB <---- BORRAR DESPUES
        const saveUser = await addUser(data)
        // Guardamos usuario en el store de Zustand
        setCurrentUser(data)
        if (saveUser || currentUser) {
          router.push(`/profile/${data.user_data._id}`)
        }
      }
    } catch (error) {
      if (error) {
        setIsLoading(false)
        console.log(error)
        setShowModalError(true)
        setErrorMessage('Ocurrio un error inesperado')
      }
    }
  }

  useEffect(() => {
    setIsLoading(true)
    setLoadingMessage('Comprobando sesiones activas...')
    ifUser()
    // ✅ Login desde WebView Android
    if (typeof window !== 'undefined') {
      console.log('window.AndroidInterface:', window.AndroidInterface)
      window.onGoogleLoginSuccess = async (idToken, email) => {
        const res = await fetch('/api/auth-google/google-auth-v2/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: idToken }),
        })

        console.log('Token recibido en React:', idToken)

        const data = await res.json()
        if (data.success) {
          const user = {
            token: data.token,
            user_data: data.user,
          }
          setCurrentUser(user)
          window.location.href = '/profile/' + data.user._id
        } else {
          alert('Hubo un error al iniciar sesión con Google.')

          console.error('Error during Google login:', data?.error)
          console.log(data)
        }
      }
    }
  }, [currentUser])

  return (
    <Container>
      {isLoading && <ModalLoading message={loadingMessage} />}
      {errorMessage && (
        <ModalError
          errorMessage={errorMessage}
          setShowModalError={setErrorMessage}
        />
      )}
      <LogoNetExpertos width={300} height={90} />
      <FormContainer method={'POST'} onSubmit={(e) => handleSubmit(e)}>
        <Inputs
          id={'userName'}
          name={'username'}
          text={'Correo'}
          type={'text'}
          errorMessage={'El correo ingresado es invalido!'}
        />
        <Inputs
          id={'password'}
          name={'password'}
          text={'Contraseña'}
          type={'password'}
          errorMessage={'Contraseña invalida!'}
        />
        <ButtonSubmit text={'INGRESAR'} />
        <div className={styles.resetPassword}>
          <p className={styles.p}>
            ¿Olvidaste tu contreseña?{' '}
            <Link className={styles.link} href='/reset-password'>
              Ingresa aqui
            </Link>
          </p>
        </div>
      </FormContainer>
      <ButtonSignInWithGoogle />

      <div className={styles.register}>
        <p className={styles.p}>¡Quiero registrarme!</p>
        <div className={styles.containerButtons}>
          <Link className={styles.registerButtons} href='/create-user-account'>
            Usuario
          </Link>
          <Link
            className={styles.registerButtons}
            href='/create-expert-account'
          >
            Experto
          </Link>
        </div>
      </div>
    </Container>
  )
}
