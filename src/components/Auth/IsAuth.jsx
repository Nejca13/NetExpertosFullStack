'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SimpleLoader from '../Loaders/SimpleLoader'
import Container from '../Containers/Container'
import NavBar from '../Navbar/NavBar'
import FormContainer from '../Containers/FormContainer'
import LogoNetExpertos from '../ui/Logo/LogoNetExpertos'
import ButtonSignInWithGoogle from '../Buttons/ButtonSignInWithGoogle/ButtonSignInWithGoogle'
import useStore from '@/store/store'

export default function isAuth(Component) {
  return function IsAuth(props) {
    const router = useRouter()
    const { currentUser } = useStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      if (!currentUser) {
        console.warn('[Auth] Usuario no autenticado')
        setTimeout(() => setIsLoading(false), 2000)
      }
    }, [currentUser])

    if (!currentUser) {
      return isLoading ? (
        <div
          style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SimpleLoader />
        </div>
      ) : (
        <Container>
          <NavBar onClick={() => router.push('/')} />
          <FormContainer>
            <LogoNetExpertos width={200} />
            <p
              style={{
                fontFamily: 'var(--font-roboto-italic)',
                color: 'var(--color-gris-medio)',
              }}
            >
              Debes iniciar sesión!
            </p>
            <ButtonSignInWithGoogle />
          </FormContainer>
        </Container>
      )
    }

    // Autenticado, renderiza el componente
    return <Component {...props} />
  }
}
