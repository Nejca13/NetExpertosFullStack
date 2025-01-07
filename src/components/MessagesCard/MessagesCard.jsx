import Image from 'next/image'
import styles from './MessagesCard.module.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import defaultImage from '@/assets/images/userImage.png'

const MessagesCard = ({ item, index, _id }) => {
  const [unSeenMessage, setUnSeenMessage] = useState(false)
  const router = useRouter()
  // Expresiones regulares para validar URLs y cadenas base64
  const urlPattern =
    /^(https?:\/\/)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/

  const base64Pattern =
    /^data:image\/(png|jpg|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/

  function getValidImageSrc(imageSrc) {
    const img = imageSrc.filter(
      (mensaje, index) =>
        mensaje.remitente_id !== _id &&
        mensaje.imagen !== '' &&
        mensaje.imagen !== undefined &&
        (!Array.isArray(mensaje) || mensaje.length > 0) // Verificar que mensaje no sea un array vacío
    )

    if (img[0] !== undefined) {
      const image = window.atob(img[0].imagen)
      if (urlPattern.test(image) || base64Pattern.test(image)) {
        return image
      }
    }
    return defaultImage
  }

  const getInfo = (mensajes) => {
    const id = mensajes.filter((mensaje, index) => mensaje.remitente_id !== _id)

    return id[0]
  }

  useEffect(() => {
    if (getInfo(item.mensajes)?.remitente_id !== undefined) {
      const mensajesNoLeidos = JSON.parse(localStorage.getItem('messages'))
      if (mensajesNoLeidos) {
        const id = getInfo(item.mensajes)?.remitente_id
        const isUnSeedMessage = mensajesNoLeidos[id]

        setUnSeenMessage(mensajesNoLeidos[id]?.length)
      }
    }
  }, [item])

  const obtenerHoraActual = (time) => {
    const ahora = time ? new Date(time) : new Date()
    const horas = String(ahora.getHours()).padStart(2, '0')
    const minutos = String(ahora.getMinutes()).padStart(2, '0')
    return `${horas}:${minutos}`
  }
  return (
    <li
      className={styles.li}
      key={index}
      onClick={() => {
        localStorage.setItem(
          getInfo(item.mensajes).remitente_id,
          JSON.stringify({
            nombre: getInfo(item.mensajes).nombre,
            apellido: getInfo(item.mensajes).apellido,
            foto_perfil: getValidImageSrc(item.mensajes),
          })
        )

        setTimeout(() => {
          router.push(`/chatroom/${getInfo(item.mensajes).remitente_id}`)
        }, 200)
      }}
    >
      <div className={styles.containerImage}>
        <Image
          className={styles.image}
          src={getValidImageSrc(item.mensajes)}
          height={60}
          width={60}
          alt='imagen remitente'
          priority
        />
      </div>
      <div className={styles.containerText}>
        <div className={styles.containerMensaje}>
          <p className={styles.nombre}>
            {getInfo(item.mensajes).nombre} {getInfo(item.mensajes).apellido}
          </p>
          <span className={styles.time}>
            {obtenerHoraActual(item.mensajes[0].time)}
          </span>
        </div>
        <div className={styles.message}>
          <p className={styles.mensaje}>{item.mensajes[0].mensaje}</p>
          {unSeenMessage && (
            <span className={styles.unsee}>{unSeenMessage}</span>
          )}
        </div>
      </div>
    </li>
  )
}

export default MessagesCard
