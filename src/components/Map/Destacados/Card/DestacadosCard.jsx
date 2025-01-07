import Image from 'next/image'
import styles from './DestacadosCard.module.css'
import { useState } from 'react'
import ProfesionalCard from '@/components/ProfesionalCard/ProfesionalCard'
import { useRouter } from 'next/navigation'
import estrellaAmarilla from '@/assets/images/estrella-Amarilla.png'
import { useShowProfesionalCard } from '@/app/profesionalCardContext'

const DestacadosCard = ({ item, index, setIsShowPopup }) => {
  const router = useRouter()
  const [showProfesionalCard, setShowProfesionalCard] = useShowProfesionalCard()
  const [showCard, setshowCard] = useState(false)
  return (
    <>
      {showCard && (
        <ProfesionalCard
          profesional={item}
          setIsShowPopup={setIsShowPopup && setIsShowPopup}
        />
      )}
      <li
        className={styles.destacadosLi}
        key={index}
        onClick={() => {
          setIsShowPopup &&
            setIsShowPopup({
              status: true,
              profesional: item,
            })

          setShowProfesionalCard({ profesional: item })
        }}
      >
        <Image
          className={styles.image}
          src={item.foto_perfil}
          width={60}
          height={60}
          alt='Imagen de experto destacado'
          quality={50}
          placeholder='blur'
        />
        <p className={styles.pName}>{item.nombre}</p>
        <p className={styles.pDescripcion}>
          {item.rubro_nombre}
          <>
            <span className={styles.spanCalificacion}>{item.calificacion}</span>{' '}
            <Image
              src={estrellaAmarilla}
              width={10}
              height={10}
              alt='estrella calificacion'
            />
          </>
        </p>
      </li>
    </>
  )
}

export default DestacadosCard
