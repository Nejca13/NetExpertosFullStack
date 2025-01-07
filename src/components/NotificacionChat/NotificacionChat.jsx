'use client'
import Image from 'next/image'
import styles from './NotificacionChat.module.css'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

const NotificacionChat = ({ message, setNotificationMessages }) => {
  const router = useRouter()
  const audioRef = useRef(null)
  const data = message[message.length - 1]

  useEffect(() => {
    const audio = audioRef.current
    const handleCanPlayThrough = () => {
      setTimeout(() => {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error)
        })
      }, 400)
    }

    if (audio) {
      audio.addEventListener('canplaythrough', handleCanPlayThrough)
    }

    return () => {
      if (audio) {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough)
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [])

  return (
    data.message && (
      <div
        className={styles.container}
        onClick={() => {
          localStorage.setItem(
            data.id,
            JSON.stringify({
              nombre: data.name,
              apellido: data.surname,
              foto_perfil: atob(data.image),
            })
          )
          setNotificationMessages([])
          setTimeout(() => {
            router.push(`/chatroom/${data.id}`)
          }, 200)
        }}
      >
        <audio src='/sounds/bubble.mp3' id='pop' ref={audioRef}></audio>
        <Image
          className={styles.imagen}
          src={atob(data.image)}
          width={30}
          height={30}
          alt='imagen de perfil'
        />
        <p className={styles.mensaje}>{data.message}</p>
      </div>
    )
  )
}

export default NotificacionChat
