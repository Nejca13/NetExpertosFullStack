'use client'
import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useWebSocket } from '@/app/WebSocketContext'
import useStore from '@/store/store'
import styles from './NotificacionChat.module.css'

const NotificacionChat = ({ setNotificationMessages }) => {
  const { currentUser } = useStore()
  const router = useRouter()
  const audioRef = useRef(null)
  const { messages } = useWebSocket()
  const data = messages[messages.length - 1]

  // ID de la conversación y estado "leído"
  const convoId = data?.conversation_id
  const readMessages = JSON.parse(localStorage.getItem('chat_leidos') || '{}')
  const isLeido = convoId ? Boolean(readMessages[convoId]?.leido) : false

  // Mensaje propio?
  const senderId = data?.message?.sender_id || data?.sender_id
  const isOwnMessage = senderId === currentUser?.user_data?._id

  /* // Evito render si no hay data, si es propio o ya está leído
  if (!data || !data.message || isOwnMessage || isLeido) {
    console.log('[Noti] No muestro noti porque:', {
      noData: !data,
      noMsg: !data?.message,
      own: isOwnMessage,
      leido: isLeido,
    })
    return null
  } */

  // Efecto que marca como leído y reproduce sonido
  useEffect(() => {
    console.log('[Noti] useEffect disparado', { convoId, isOwnMessage })

    if (!convoId || isOwnMessage) return

    const stored = JSON.parse(localStorage.getItem('chat_leidos') || '{}')
    if (stored[convoId]?.leido) {
      console.log('[Noti] Ya marcado como leído, salgo.')
      return
    }

    stored[convoId] = {
      lastMessageTimestamp: data.timestamp,
      leido: true,
    }
    localStorage.setItem('chat_leidos', JSON.stringify(stored))
    console.log('[Noti] Marked as read:', stored)

    const audio = audioRef.current
    console.log('[Noti] Reproduciendo audio...')
    setTimeout(() => {
      audio
        ?.play()
        .then(() => console.log('[Noti] Audio OK'))
        .catch((e) => console.error('[Noti] Error audio', e))
    }, 1000)

    console.log(data)
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
        console.log('[Noti] Audio reset')
      }
    }
  }, [convoId, isOwnMessage, data.timestamp])

  // Render de la notificación
  return (
    <div
      className={styles.container}
      onClick={() => {
        console.log('[Noti] Click en noti, abriendo chat', { convoId, data })
        // Guardar perfil del otro
        localStorage.setItem(
          data.conversation_id,
          JSON.stringify({
            _id: data.sender_id,
            conversation_id: data.conversation_id,
            nombre: data.sender_name,
            apellido: data.sender_surname,
            foto_perfil: data.image,
          })
        )
        // Limpiar marca de leído
        const lm = JSON.parse(localStorage.getItem('chat_leidos') || '{}')
        console.log('[Noti] Antes delete:', lm)
        delete lm[convoId]
        localStorage.setItem('chat_leidos', JSON.stringify(lm))
        console.log('[Noti] Después delete:', lm)

        setNotificationMessages([])
        setTimeout(() => {
          router.push(`/chatroom/${data.conversation_id}`)
        }, 200)
      }}
    >
      <audio src='/sounds/bubble.mp3' ref={audioRef} />
      <Image
        className={styles.imagen}
        src={data.image}
        width={30}
        height={30}
        alt='Perfil'
      />
      <p className={styles.mensaje}>{data.message}</p>
    </div>
  )
}

export default NotificacionChat
