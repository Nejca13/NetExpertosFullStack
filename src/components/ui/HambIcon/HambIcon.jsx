import hamb from '@/assets/images/hamb.svg'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from './HambIcon.module.css'
import MAIL from '@/assets/images/ICONOS/ICO-MAIL.svg'
import { useRouter } from 'next/navigation'

const HambIcon = ({ show, userApp, messages }) => {
  const [notifications, setNotifications] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (messages) {
      const mensajesNoLeidos = JSON.parse(localStorage.getItem('messages'))
      if (mensajesNoLeidos) {
        if (Object.keys(mensajesNoLeidos).length > 0) {
          setNotifications(true)
        } else {
          setNotifications(false)
        }
      }
    }
  }, [messages])
  return (
    <div className={styles.container}>
      {notifications && (
        <span
          className={styles.notifications}
          onClick={() => {
            router.push(`/profile/${userApp._id}/${userApp.rol}/chats`)
          }}
        >
          <Image
            src={MAIL}
            width={14}
            height={14}
            alt='icono de mensajes sin leer'
          />
        </span>
      )}
      <Image
        onClick={show}
        style={{ cursor: 'pointer' }}
        src={hamb}
        width={50}
        height={50}
        alt='menu'
      />
    </div>
  )
}

export default HambIcon
