'use client'
import Container from '@/components/Containers/Container'
import styles from './Page.module.css'
import FormContainer from '@/components/Containers/FormContainer'
import { Inputs } from '@/components/FormComponents/FormComponents'
import { useParams, useRouter } from 'next/navigation'
import LogoNetExpertos from '@/components/ui/Logo/LogoNetExpertos'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import NavBar from '@/components/Navbar/NavBar'
import { verifyClientsCode } from '@/services/api/authUsuarios'
import ModalLoading from '@/components/ui/Modals/ModalLoading/ModalLoading'
import ModalError from '@/components/ui/Modals/ModalError/ModalError'
import { useState } from 'react'

const Page = () => {
  const [errorMessage, setErrorMessage] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { correo } = useParams()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))
    try {
      const response = await verifyClientsCode(formData)
      if (response === true) {
        router.push(`/`)
      }
    } catch (error) {
      setErrorMessage(error.detail)
      console.log(error.detail)
      return error
    }
  }

  return (
    <Container>
      {errorMessage && (
        <ModalError
          errorMessage={errorMessage}
          setShowModalError={setErrorMessage}
        />
      )}
      <NavBar onClick={() => router.back()} />
      <FormContainer onSubmit={(e) => handleSubmit(e)}>
        <LogoNetExpertos height={80} />
        <p className={styles.p}>Ingresa el codigo de verificación!</p>
        <Inputs
          text={'Correo'}
          type={'text'}
          id={'username'}
          value={decodeURIComponent(correo)}
          name={'username'}
          readOnly={true}
        />
        <Inputs
          text={'Codigo de verificación'}
          type={'text'}
          id={'otp'}
          name={'otp'}
        />
        <span className={styles.span}>
          El codigo de verificacion fue enviado a tu correo.
        </span>
        <ButtonSubmit text={'ENVIAR'} />
      </FormContainer>
    </Container>
  )
}

export default Page
