import FormContainer from '../Containers/FormContainer'
import { Inputs } from './FormComponents'
import ButtonSubmit from '../Buttons/ButtonSubmit/ButtonSubmit'

const SeccionDatosPersonales = ({ onNext }) => {
  return (
    <FormContainer onSubmit={(e) => onNext(e)}>
      <Inputs
        type={'text'}
        placeholder={'Nombre y apellido'}
        text={'Nombre y apellido'}
        name={'nombre_apellido'}
        id={'nombre_apellido'}
        errorMessage={'El nombre ingresado tiene un formato no valido.'}
      />
      <Inputs
        text={'Correo electronico'}
        name={'correo'}
        id={'correo'}
        placeholder={'correo@empresa.com'}
        type={'email'}
        errorMessage={'Ingrese un correo valido. EJ: nombre@email.com'}
      />
      <Inputs
        id={'password'}
        name={'password'}
        type={'password'}
        text={'Contraseña'}
        errorMessage={
          'Fomato de contraseña incorrectaLa contraseña debe tener al menos 8 caracteres e incluir al menos una letra minúscula, una letra mayúscula, un número y un símbolo especial.'
        }
      />
      <Inputs
        id={'password2'}
        name={'password2'}
        type={'password'}
        text={'Confirmar contraseña'}
        errorMessage={
          'Fomato de contraseña incorrectaLa contraseña debe tener al menos 8 caracteres e incluir al menos una letra minúscula, una letra mayúscula, un número y un símbolo especial.'
        }
      />
      <ButtonSubmit text={'SIGUIENTE'} />
    </FormContainer>
  )
}

export default SeccionDatosPersonales
