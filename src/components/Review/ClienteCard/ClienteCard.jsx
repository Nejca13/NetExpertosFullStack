import Calificacion from '@/components/Calificacion/Calificacion'
import { formatDateShort } from '@/utils/formatDateOnly'
import Image from 'next/image'
import styles from './ClienteCard.module.css'

const ClienteCard = ({ resena }) => {
  return (
    <div className={styles.resena}>
      <div className={styles.info_cliente}>
        <div className={styles.cliente}>
          <Image
            src={resena?.foto_cliente}
            width={40}
            height={40}
            alt='foto_cliente'
          />
          <div className={styles.reating_cliente}>
            <span>{resena?.nombre_cliente}</span>
            <small>
              <Calificacion rating={resena?.puntuacion} size='16px' />
              {resena?.puntuacion}
            </small>
          </div>
        </div>
        <small className={styles.date}>
          {formatDateShort(resena?.fecha_creacion)}
        </small>
      </div>
      <p className={styles.coment}>{resena?.comentario}</p>
    </div>
  )
}

export default ClienteCard
