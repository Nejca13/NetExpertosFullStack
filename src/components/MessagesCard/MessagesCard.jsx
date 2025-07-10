import Image from 'next/image'
import styles from './MessagesCard.module.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import defaultImage from '@/assets/images/userImage.png'

const MessagesCard = ({ item, index, _id }) => {
  const [unSeenMessage, setUnSeenMessage] = useState(false)
  const router = useRouter()

  const obtenerHoraActual = (time) => {
    const ahora = time ? new Date(time) : new Date()
    const horas = String(ahora.getHours()).padStart(2, '0')
    const minutos = String(ahora.getMinutes()).padStart(2, '0')
    return `${horas}:${minutos}`
  }

  useEffect(() => {
    const mensajesNoLeidos = JSON.parse(localStorage.getItem('messages'))
    if (mensajesNoLeidos) {
      const id = item.ultimo_mensaje.sender_id
      const isUnseen = mensajesNoLeidos[id]
      if (isUnseen?.length) {
        setUnSeenMessage(isUnseen.length)
      }
    }
    console.log(item)
  }, [item])

  const { apellido, nombre, foto_perfil, conversacion_id } = item
  const { timestamp, message } = item.ultimo_mensaje

  return (
    <li
      className={styles.li}
      key={index}
      onClick={() => {
        console.log({
          _id: _id,
          conversacion_id: conversacion_id,
          nombre: nombre,
          apellido: apellido,
          foto_perfil: foto_perfil,
        })
        localStorage.setItem(
          conversacion_id,
          JSON.stringify({
            _id: _id,
            conversation_id: conversacion_id,
            nombre: nombre,
            apellido: apellido,
            foto_perfil: foto_perfil,
          })
        )

        setTimeout(() => {
          router.push(`/chatroom/${conversacion_id}`)
        }, 200)
      }}
    >
      <div className={styles.containerImage}>
        <Image
          className={styles.image}
          src={item.foto_perfil}
          height={60}
          width={60}
          alt='imagen remitente'
          priority
        />
      </div>
      <div className={styles.containerText}>
        <div className={styles.containerMensaje}>
          <p className={styles.nombre}>
            {item.nombre} {item.apellido}
          </p>
          <span className={styles.time}>{obtenerHoraActual(timestamp)}</span>
        </div>
        <div className={styles.message}>
          <p className={styles.mensaje}>{message}</p>
          {unSeenMessage && (
            <span className={styles.unsee}>{unSeenMessage}</span>
          )}
        </div>
      </div>
    </li>
  )
}

export default MessagesCard
