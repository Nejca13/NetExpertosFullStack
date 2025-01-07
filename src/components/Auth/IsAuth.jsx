'use client'
import { useEffect, useState } from 'react'
import { redirect, useParams, useRouter } from 'next/navigation'
import SimpleLoader from '../Loaders/SimpleLoader'
import { getFirstUser, getUser } from '@/utils/indexedDataBase'
import Container from '../Containers/Container'
import NavBar from '../Navbar/NavBar'
import FormContainer from '../Containers/FormContainer'
import LogoNetExpertos from '../ui/Logo/LogoNetExpertos'
import ButtonSignInWithGoogle from '../Buttons/ButtonSignInWithGoogle/ButtonSignInWithGoogle'

export default function isAuth(Component) {
  return function IsAuth(props) {
    const [isLoading, setIsLoading] = useState(true)
    const [auth, setAuth] = useState(null)
    const router = useRouter()

    const { _id } = useParams()

    const setUser = async () => {
      const authValue = await getUser(_id)
      const user = await getFirstUser()
      if (authValue || user) {
        setAuth(authValue?.user_data || user.user_data)
      }
    }

    useEffect(() => {
      setUser()
    }, [])

    useEffect(() => {
      if (auth === null) {
        setTimeout(() => {
          setIsLoading(false)
        }, 5000)
        // Si auth aún no se ha establecido, no hagas nada
        return
      }

      if (!auth) {
        redirect('/')
      }
    }, [auth])

    if (auth === null) {
      // Si auth aún no se ha establecido, muestra un estado de carga o algo similar
      return isLoading === true ? (
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
              Debes iniciar sesion!
            </p>
            <ButtonSignInWithGoogle />
          </FormContainer>
        </Container>
      )
    }

    if (!auth) {
      return null
    }

    if (typeof window !== 'undefined') {
      return <Component {...props} />
    }
  }
}
