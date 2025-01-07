import styles from './SeccionTrabajos.module.css'
import FormContainer from '../Containers/FormContainer'
import Image from 'next/image'
import ButtonSubmit from '../Buttons/ButtonSubmit/ButtonSubmit'
import { useState } from 'react'
import MultiImageForm from '../MultiImageForm/MultiImageForm'
import ImagenPlus from '@/assets/images/SignoMas.png'
import Eliminar from '@/assets/images/Eliminar.png'

const SeccionTrabajos = ({ onNext, onBack }) => {
  const [arr, setArr] = useState([1])

  return (
    <FormContainer
      onSubmit={(e) => {
        e.preventDefault()
        onNext(e)
      }}
    >
      <p className={styles.title}>Carga fotos de tus ultimos trabajos</p>
      <div className={styles.carrusel}>
        {arr.length > 0 &&
          arr.map((item, index) => (
            <MultiImageForm index={index} key={index} />
          ))}
      </div>
      <div className={styles.botonesMasMenos}>
        <button
          className={styles.buttonMore}
          onClick={(e) => {
            e.preventDefault()
            if (arr.length < 6) {
              setArr([...arr, 1])
            } else {
              alert('Alcanzaste el maximo de imagenes para mostrar!')
            }
          }}
        >
          <Image
            src={ImagenPlus}
            width={25}
            height={25}
            alt='icono agregar mas'
          />
        </button>
        {arr.length > 1 && (
          <button
            className={styles.buttonMore}
            onClick={(e) => {
              e.preventDefault()
              const newItems = [...arr] // Creamos una copia del array original
              newItems.pop() // Eliminamos el elemento en la posición indexToRemove
              setArr(newItems)
            }}
          >
            <Image src={Eliminar} width={25} height={25} alt='icono eliminar' />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '30px', width: '100%' }}>
        <ButtonSubmit text={'SIGUIENTE'} />
      </div>
    </FormContainer>
  )
}

export default SeccionTrabajos
