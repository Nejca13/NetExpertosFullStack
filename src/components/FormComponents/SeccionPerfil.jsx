import styles from './SeccionPerfil.module.css'
import FormContainer from '../Containers/FormContainer'
import SimpleLoader from '../Loaders/SimpleLoader'
import Image from 'next/image'
import ButtonSubmit from '../Buttons/ButtonSubmit/ButtonSubmit'
import { InputTypeFile, Inputs, TextArea } from './FormComponents'
import checkIcon from '../../assets/images/checkIcon.svg'
import Button from '../Buttons/Button/Button'
import { useEffect, useState } from 'react'

const SeccionPerfil = ({ onNext, onBack, currentUser }) => {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    const storedLocation = JSON.parse(localStorage.getItem('userLocation'))
    if (storedLocation) {
      setLocation(storedLocation)
    } else {
      alert(
        'Obtener la ubicación actual es necesario para el correcto funcionamiento de la aplicación!'
      )
    }
  }, [])

  return (
    <FormContainer
      onSubmit={(e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.target))
        if (data.password === data.password2) {
          onNext(e)
        } else {
          alert('Las contraseñas deben ser identicas')
        }
      }}
    >
      <div>
        <label className={styles.labelHorarios} htmlFor='horarioDeAtencion'>
          Horarios de atencion
        </label>
        <div className={styles.horariosDeAtencion}>
          <p className={styles.p}>de</p>
          <Inputs
            type={'time'}
            name='horario_apertura'
            id={'horario_apertura'}
            value={'00:00'}
          />
          <p className={styles.p}>hasta las</p>
          <Inputs
            type={'time'}
            name='horario_cierre'
            id={'horario_cierre'}
            value={'00:00'}
          />
        </div>
      </div>
      <Inputs
        id={'experiencia'}
        name={'experiencia_laboral_años'}
        placeholder={0}
        value={0}
        type={'number'}
        text={'Experiencia Laboral'}
        errorMessage={'Debe ingresar los años de experiencia laboral. EJ: 1'}
      />
      <Inputs
        type={'tel'}
        name={'telefono'}
        id={'telefono'}
        placeholder={'2984404040'}
        errorMessage={
          'Debe ingresar un numero de telefono valido para Argentina'
        }
        text={'Numero de contacto'}
        minLength={10}
      />
      <Inputs
        text={'Correo de contacto'}
        type={'email'}
        readOnly={true}
        placeholder={'correo@empresa.com'}
        id={'correo'}
        name={'correo'}
        value={currentUser.user_data.correo}
        errorMessage={'Debe ingresar un correo valido.'}
      />
      <TextArea
        text={'Descripción'}
        id={'acerca_de_mi'}
        name={'acerca_de_mi'}
        placeholder={
          'Escribe una descripcion sobre tu profesion y habilidades.'
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
          <Image src={checkIcon} width={25} height={25} alt='Icono de check' />
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
      </ul>
      <p className={styles.p}>
        Al crear una cuenta, aceptas nuestras políticas de privacidad
      </p> */}
      <div style={{ display: 'flex', gap: '30px', width: '100%' }}>
        <ButtonSubmit text={'SIGUIENTE'} />
      </div>
    </FormContainer>
  )
}

export default SeccionPerfil
