'use client'

import Container from '@/components/Containers/Container'
import FormContainer from '@/components/Containers/FormContainer'
import NavBar from '@/components/Navbar/NavBar'
import styles from './page.module.css'
import { Inputs } from '@/components/FormComponents/FormComponents'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import { useRouter } from 'next/navigation'

const Page = () => {
  const router = useRouter()

  return (
    <Container>
      <NavBar title={'Recuperar cuenta'} onClick={() => router.back()} />
      <FormContainer>
        <p className={styles.p}>
          Introduce tú dirección de email y te enviaremos las instrucciones para
          restablecer tú contraseña.
        </p>
        <Inputs
          type={'email'}
          id={'email'}
          name={'email'}
          placeholder={'Escribe tu email'}
        />
        <ButtonSubmit
          text={'RECUPERAR CONTRASEÑA'}
          action={(e) => {
            e.preventDefault()
            alert('Email con los pasos de recuperacion enviado!')
          }}
        />
      </FormContainer>
    </Container>
  )
}

export default Page
