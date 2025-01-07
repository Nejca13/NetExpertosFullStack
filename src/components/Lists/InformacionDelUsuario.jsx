import Image from 'next/image'
import FormContainer from '../Containers/FormContainer'
import styles from './InformacionDelUsuario.module.css'
import Button from '../Buttons/Button/Button'
import SimpleLoader from '../Loaders/SimpleLoader'
import { createProfesional } from '@/services/api/profesionales'
import { useState } from 'react'

const InformacionDelUsuario = ({ data }) => {
  const [isWaitingData, setIsWaitingData] = useState(false)
  return isWaitingData ? (
    <SimpleLoader />
  ) : (
    <FormContainer>
      <Button
        text={'Confirmar datos y enviar'}
        func={(e) => {
          e.preventDefault()
          createProfesional(data)
        }}
      />
    </FormContainer>
  )
}

export default InformacionDelUsuario
