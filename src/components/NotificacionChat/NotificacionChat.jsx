'use client'
import Image from 'next/image'
import styles from './NotificacionChat.module.css'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useWebSocket } from '@/app/WebSocketContext'
import useStore from '@/store/store'

const NotificacionChat = ({ setNotificationMessages }) => {
  const { currentUser } = useStore()
  const router = useRouter()
  const audioRef = useRef(null)
  const { messages } = useWebSocket()
  const data = messages[messages.length - 1]

  const senderId = data?.message?.sender_id || data?.sender_id
  const isOwnMessage = senderId === currentUser?.user_data?._id

  useEffect(() => {
    if (!data || isOwnMessage) return

    const audio = audioRef.current
    const playAudio = () => {
      setTimeout(() => {
        audio?.play().catch((e) => console.error('Error playing audio', e))
      }, 400)
    }

    playAudio()

    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [data, isOwnMessage])

  if (!data || !data.message || isOwnMessage) return null

  return (
    <div
      className={styles.container}
      onClick={() => {
        localStorage.setItem(
          data.sender_id,
          JSON.stringify({
            _id: data.sender_id,
            nombre: data.name,
            apellido: data.surname,
            foto_perfil: data.image,
          })
        )
        setNotificationMessages([])
        setTimeout(() => {
          router.push(`/chatroom/${data.sender_id}`)
        }, 200)
      }}
    >
      <audio src='/sounds/bubble.mp3' id='pop' ref={audioRef}></audio>
      <Image
        className={styles.imagen}
        src={data.image}
        width={30}
        height={30}
        alt='imagen de perfil'
      />
      <p className={styles.mensaje}>{data.message}</p>
    </div>
  )
}

export default NotificacionChat
