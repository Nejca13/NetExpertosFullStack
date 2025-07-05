import Calificacion from '@/components/Calificacion/Calificacion'
import styles from './ProfesionalCard.module.css'
import Image from 'next/image'
import { formatDateShort } from '@/utils/formatDateOnly'

const ProfesionalCard = ({ response }) => {
  return (
    <div className={styles.container}>
      <div className={styles.info_profesional}>
        <div className={styles.profesional}>
          <Image
            src={response?.foto_profesional}
            width={40}
            height={40}
            alt='foto_cliente'
          />
          <div className={styles.profesional_text}>
            <span>{response?.nombre_cliente}</span>
            <small className={styles.date}>Respuesta</small>
          </div>
        </div>
        <small className={styles.date}>
          {formatDateShort(response?.respuesta_profesional?.fecha_respuesta)}
        </small>
      </div>
      <p>{response?.respuesta_profesional?.respuesta}</p>
    </div>
  )
}

export default ProfesionalCard
