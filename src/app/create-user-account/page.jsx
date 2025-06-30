'use client'
import styles from './page.module.css'
import {
  InputTypeFile,
  Inputs,
} from '@/components/FormComponents/FormComponents'
import NavBar from '@/components/Navbar/NavBar'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import Container from '@/components/Containers/Container'
import FormContainer from '@/components/Containers/FormContainer'
import SimpleLoader from '@/components/Loaders/SimpleLoader'
import checkIcon from '../../assets/images/checkIcon.svg'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import defaultUserImage from '../../assets/images/userImage.png'
import { createUser } from '@/services/api/clientes'
import { saveCompressedImageToLocalStorage } from '@/utils/minificadorDeImagenes'
import { useRouter } from 'next/navigation'
import ModalError from '@/components/ui/Modals/ModalError/ModalError'
import ModalLoading from '@/components/ui/Modals/ModalLoading/ModalLoading'

const Page = () => {
  const [userImage, setUserImage] = useState(defaultUserImage)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [onError, setOnError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [location, setLocation] = useState(null)

  useEffect(() => {
    if (!location) {
      const storedLocation = JSON.parse(localStorage.getItem('userLocation'))
      if (storedLocation) {
        setLocation(storedLocation)
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. Construir el FormData a partir del <form>
    const formData = new FormData(e.target)

    // 2. Añadir la foto (si la traés por estado)
    if (profilePhoto) {
      formData.append('image', profilePhoto)
    }

    // 3. Extraer nombre y apellido de un único campo
    const fullName = formData.get('nombre_apellido') || ''
    const [nombre = '', apellido = ''] = fullName.trim().split(' ')

    // 4. Añadir nombre y apellido separados
    formData.append('nombre', nombre)
    formData.append('apellido', apellido)

    // 5. Llamar a tu API con FormData directamente
    createUser(formData, setOnError, setLoading)
      .then((res) => {
        if (res === true) {
          // redirigir una vez creado
          router.push(`/verifyAccount/cliente/${formData.get('correo')}`)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    /* saveCompressedImageToLocalStorage(file, (compressedImage) => {
      setUserImage(compressedImage)
      setProfilePhoto(compressedImage)
    }) */
    const reader = new FileReader()
    reader.onload = () => {
      setUserImage(reader.result)
      setProfilePhoto(file)
    }
    reader.readAsDataURL(file)
  }
  return (
    <Container>
      {loading && <ModalLoading message={loading} />}
      {onError && (
        <ModalError errorMessage={onError} setShowModalError={setOnError} />
      )}
      <NavBar title={'Crear cuenta de Usuario'} onClick={() => router.back()} />
      <FormContainer
        onSubmit={(e) => {
          e.preventDefault()
          const data = Object.fromEntries(new FormData(e.target))
          if (data.password === data.password2) {
            handleSubmit(e)
          } else {
            console.log('Las contraseñas deben ser identicas')
          }
        }}
        method={'POST'}
      >
        <Image
          className={styles.userImage}
          src={userImage}
          width={60}
          height={60}
          style={{ borderRadius: '100%' }}
          alt='Foto de perfil del usuario'
        />
        <InputTypeFile
          className={styles.inputFile}
          handleFileChange={handleFileChange}
          name={'foto_perfil'}
          id={'foto_perfil'}
          text={'Foto de perfil'}
        />
        <Inputs
          type={'text'}
          name={'nombre_apellido'}
          placeholder={'Nombre y apellido'}
          text={'Nombre y apellido'}
          id={'nombre_apellido'}
          errorMessage={'El nombre ingresado tiene un formato no valido.'}
        />
        <Inputs
          id={'correo'}
          placeholder={'Email'}
          name={'correo'}
          type={'email'}
          text={'Email'}
          errorMessage={'Ingrese un correo valido. EJ: nombre@email.com'}
        />
        <Inputs
          id={'password'}
          name={'password'}
          type={'password'}
          text={'Contraseña'}
          errorMessage={
            'Fomato de contraseña incorrecta La contraseña debe tener al menos 8 caracteres e incluir al menos una letra minúscula, una letra mayúscula, un número y un símbolo especial.'
          }
        />
        <Inputs
          id={'password2'}
          name={'password2'}
          type={'password'}
          text={'Vuelva a repetir la contraseña'}
          errorMessage={
            'Fomato de contraseña incorrecta La contraseña debe tener al menos 8 caracteres e incluir al menos una letra minúscula, una letra mayúscula, un número y un símbolo especial.'
          }
        />
        <Inputs
          type={'hidden'}
          name={'ubicacion'}
          id={'ubicacion'}
          value={location && `${location.latitude}, ${location.longitude}`}
        />
        <span className={styles.ubicacionSpan}>
          Ubicación:{' '}
          {location ? (
            <Image
              src={checkIcon}
              width={25}
              height={25}
              alt='Icono de check'
            />
          ) : (
            <SimpleLoader />
          )}
        </span>
        {/* <ul className={styles.ul}>
          <li className={styles.li}>8 Caracteres</li>
          <li className={styles.li}>Una minúscula</li>
          <li className={styles.li}>Una mayúscula</li>
          <li className={styles.li}>Un número</li>
          <li className={styles.li}>Un simbolo</li>
        </ul> */}
        <ButtonSubmit text={'CREAR CUENTA'} />
      </FormContainer>
    </Container>
  )
}

export default Page
