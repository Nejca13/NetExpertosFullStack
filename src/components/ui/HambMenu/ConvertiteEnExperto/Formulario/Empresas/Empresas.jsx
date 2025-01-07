import { Inputs, Select } from '@/components/FormComponents/FormComponents'
import rubros from '@/constants/rubros'
import profesionesPorRubro from '@/constants/profesionesPorRubro'
import { useEffect, useState } from 'react'
import ButtonSubmit from '@/components/Buttons/ButtonSubmit/ButtonSubmit'
import styles from './Empresas.module.css'
import FormContainer from '@/components/Containers/FormContainer'

const Empresas = ({ onNext }) => {
  const [rubroSeleccionado, setRubroSeleccionado] = useState('')

  useEffect(() => {
    setRubroSeleccionado(rubros[0])
  }, [])

  return (
    <FormContainer onSubmit={(e) => onNext(e)}>
      <Inputs
        text={'Nombre de la empresa'}
        name={'empresa_nombre'}
        id={'empresa_nombre'}
        type={'text'}
        placeholder={'Security and System'}
      />
      <Inputs
        type={'date'}
        text={'Fecha de fundación'}
        id={'nacimiento'}
        name={'nacimiento'}
        errorMessage={'Fecha incorrecta'}
      />
      <Select
        data={rubros}
        id={'rubro'}
        name={'rubro_nombre'}
        text={'Selecciona tu rubro'}
        func={(e) => setRubroSeleccionado(e.target.value)}
      />
      {rubroSeleccionado && (
        <Select
          data={profesionesPorRubro[rubroSeleccionado]}
          id={'profesion'}
          name={'profesion_nombre'}
          text={'Selecciona tu profesión'}
        />
      )}

      <div style={{ display: 'flex', gap: '30px', width: '100%' }}>
        <ButtonSubmit text={'SIGUIENTE'} />
      </div>
    </FormContainer>
  )
}

export default Empresas
