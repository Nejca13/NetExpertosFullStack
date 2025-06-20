'use client'
import React, { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import TEL from '@/assets/images/ICONOS/ICO-TEL.svg'
import SEND from '@/assets/images/ICONOS/ICO-SEND.svg'
import EMOJI from '@/assets/images/ICONOS/ICO-EMOJI.svg'
import { useParams, useRouter } from 'next/navigation'
import SlideToUnlock from '@/components/SlideToUnlock/SlideToUnlock'
import IsAuth from '@/components/Auth/IsAuth'
import EmojiPicker from 'emoji-picker-react'
import { getFirstUser } from '@/utils/indexedDataBase'
import { getChats } from '@/services/api/chat'
import { useWebSocket } from '@/app/WebSocketContext'
import { removeMessagesById } from '@/utils/localStorage'
import ArrowBackIcon from '@/assets/images/ArrowBack'

const Chat = () => {
  const { _id } = useParams()
  const [prof, setProf] = useState(null)
  const [currentMessage, setCurrentMessage] = useState('')
  const router = useRouter()
  const textareaRef = useRef(null)
  const containerRef = useRef(null)
  const { ws, messages, setUserId, setMessages, setRole, sendMessage } =
    useWebSocket()
  const [user, setUser] = useState(null)
  const [showEmojis, setShowEmojis] = useState(false)

  useEffect(() => {
    textareaRef.current?.focus()
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setProf(JSON.parse(localStorage.getItem(_id)))
  }, [_id])

  useEffect(() => {
    removeMessagesById(_id)
    const fetchUser = async () => {
      const user = await getFirstUser()
      setUser(user)
      if (user) {
        setUserId(user.user_data._id)
        setRole(user.user_data.rol)
        await getChats(_id, user.user_data._id)
          .then((response) => {
            setMessages(response?.mensajes)
          })
          .catch((error) => console.log(error))
      }
    }
    if (!user) {
      fetchUser()
    }
  }, [user, ws])

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  const handleSend = () => {
    const image_perfil = user.user_data.foto_perfil

    setShowEmojis(false)

    if (currentMessage.trim() !== '') {
      const messageToSend = {
        receiver_id: _id,
        message: currentMessage,
        image: image_perfil, // codificás como antes
        sender_name: user.user_data.nombre,
        sender_surname: user.user_data.apellido,
      }

      sendMessage(messageToSend)

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender_id: user.user_data._id,
          message: currentMessage,
          timestamp: new Date().toISOString(),
        },
      ])

      setCurrentMessage('')
      scrollToBottom()

      const PopMensajeSaliente = document.querySelector('#popMensajeSaliente')
      PopMensajeSaliente.volume = 0.3
      PopMensajeSaliente.play()
    }
  }

  const obtenerHoraActual = (time) => {
    const ahora = time ? new Date(time) : new Date()
    // Parsear a hora Argentina
    ahora.setHours(ahora.getHours() - 3)
    const horas = String(ahora.getHours()).padStart(2, '0')
    const minutos = String(ahora.getMinutes()).padStart(2, '0')
    return `${horas}:${minutos}`
  }

  return (
    <div className={styles.container}>
      <audio src='/sounds/Pop2.mp3' id='popMensajeSaliente'></audio>
      {prof && user && (
        <>
          <div className={styles.header}>
            <div className={styles.div}>
              <ArrowBackIcon _id={_id} />
              <Image
                className={styles.imagenPerfil}
                src={prof.foto_perfil}
                height={43}
                width={43}
                alt='Imagen de perfil'
              />
              <p className={styles.username}>
                {prof.nombre} {prof.apellido}
              </p>
            </div>
            <Image
              className={styles.iconoLlamada}
              src={TEL}
              height={40}
              width={40}
              alt='Imagen de perfil'
            />
          </div>
          <div className={styles.chats} ref={containerRef}>
            {messages.map((message, index) => {
              if (
                message.id === user.user_data._id ||
                message.sender_id === user.user_data._id
              ) {
                return (
                  <p key={index} className={styles.mensajeSaliente}>
                    {message.message}
                    <span className={styles.hora}>
                      {obtenerHoraActual(message.timestamp)}
                    </span>
                  </p>
                )
              }
              if (message.id === _id || message.sender_id === _id) {
                return (
                  <p key={index} className={styles.mensajeEntrante}>
                    {message.message}
                    <span className={styles.hora}>
                      {obtenerHoraActual(message.timestamp)}
                    </span>
                  </p>
                )
              }
            })}
          </div>
          <div className={styles.containerInput}>
            <button
              className={styles.botonEnviar}
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Image src={EMOJI} height={30} alt='icono emojis' />
            </button>
            <textarea
              maxLength={300}
              ref={textareaRef}
              className={styles.input}
              cols={18}
              autoFocus={true}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder='Escribe tu mensaje'
            />

            <button className={styles.botonEnviar} onClick={handleSend}>
              <Image src={SEND} alt='icono enviar' height={30} />
            </button>

            <div className={styles.containerEmojis}>
              <EmojiPicker
                open={showEmojis}
                onEmojiClick={(e) =>
                  setCurrentMessage(currentMessage + e.emoji)
                }
                emojiStyle='native'
                lazyLoadEmojis={true}
                searchDisabled={true}
                width={300}
                height={300}
              />
            </div>
          </div>
          <SlideToUnlock />
        </>
      )}
    </div>
  )
}

export default IsAuth(Chat)
