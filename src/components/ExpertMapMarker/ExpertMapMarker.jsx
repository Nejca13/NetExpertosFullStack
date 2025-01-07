import Image from 'next/image'
import styles from './ExpertMapMarker.module.css'
import defaultImg from '@/assets/images/userImage.png'
import { useEffect, useState } from 'react'
import ESTRELLA from '@/assets/images/estrella-Amarilla.png'

const ExpertMapMarker = ({ profesional, status }) => {
  const {
    calificacion,
    acerca_de_mi,
    apellido,
    correo,
    experiencia_laboral_años,
    nombre,
    fotos_trabajos,
    rubro_nombre,
    profesion_nombre,
    nacimiento,
    numero,
    foto_perfil,
    horarios_atencion,
  } = profesional

  return (
    <div className={styles.pin1}>
      <div className={[status === true && styles.online]}></div>
      <div className={styles.rating}>
        <p>{calificacion}</p>{' '}
        <Image
          src={ESTRELLA}
          width={13}
          height={13}
          alt='estrella de calificacion'
        />
      </div>
      <Image
        className={styles.image}
        src={foto_perfil ? foto_perfil : defaultImg}
        width={40}
        height={40}
        alt='imagen experto'
      />
    </div>
  )
}

export default ExpertMapMarker
