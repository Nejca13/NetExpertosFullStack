'use client'
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import styles from './page.module.css'
import Image from 'next/image'
import TEL from '@/assets/images/ICONOS/ICO-TEL.svg'
import SEND from '@/assets/images/ICONOS/ICO-SEND.svg'
import EMOJI from '@/assets/images/ICONOS/ICO-EMOJI.svg'
import { useParams, useRouter } from 'next/navigation'
import SlideToUnlock from '@/components/SlideToUnlock/SlideToUnlock'
import IsAuth from '@/components/Auth/IsAuth'
import EmojiPicker from 'emoji-picker-react'
import { getChats } from '@/services/api/chat'
import { useWebSocket } from '@/app/WebSocketContext'
import { removeMessagesById } from '@/utils/localStorage'
import ArrowBackIcon from '@/assets/images/ArrowBack'
import useStore from '@/store/store'

const Chat = () => {
  const { _id } = useParams()
  const [prof, setProf] = useState(null)
  const [currentMessage, setCurrentMessage] = useState('')
  const { currentUser } = useStore()
  const textareaRef = useRef(null)
  const containerRef = useRef(null)
  const { ws, messages, setUserId, setMessages, setRole, sendMessage } =
    useWebSocket()
  const [user, setUser] = useState(null)
  const [showEmojis, setShowEmojis] = useState(false)
  const router = useRouter()

  useEffect(() => {
    textareaRef.current?.focus()
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }

    const lastMessage = messages[messages.length - 1]
    const convo_id = lastMessage?.conversation_id
    if (lastMessage) {
      const chatLeidos = JSON.parse(localStorage.getItem('chat_leidos') || '{}')
      // key = conversation id (_id de useParams, es el participante/prof
      chatLeidos[convo_id] = {
        lastMessageTimestamp: lastMessage.timestamp,
        leido: true,
      }
      localStorage.setItem('chat_leidos', JSON.stringify(chatLeidos))
    }
  }, [messages])

  const leido = useMemo(() => {
    const chatLeidos = JSON.parse(localStorage.getItem('chat_leidos') || '{}')
    return chatLeidos[_id]?.leido
  }, [_id, messages])

  useEffect(() => {
    const storedProf = localStorage.getItem(_id)
    if (storedProf) setProf(JSON.parse(storedProf))
    if (!storedProf) {
      console.log('DEBUG No se pudo obtener el profesional')
    }
  }, [_id])

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [])

  const obtenerHoraActual = useCallback((time) => {
    const ahora = new Date(time)
    ahora.setHours(ahora.getHours() - 3)
    const horas = String(ahora.getHours()).padStart(2, '0')
    const minutos = String(ahora.getMinutes()).padStart(2, '0')
    return `${horas}:${minutos}`
  }, [])

  const updateChats = useCallback(async () => {
    if (!currentUser) return
    try {
      const response = await getChats(_id)
      const nuevosMensajes = response?.mensajes
      console.log(nuevosMensajes.length)
      if (nuevosMensajes.length === 0) {
        await recuperarConversacionEntreDosIds()
      }
      setMessages(nuevosMensajes)
      scrollToBottom()
    } catch (error) {
      console.log(error)
    }
  }, [_id, currentUser, setMessages, scrollToBottom])

  useEffect(() => {
    if (!user) {
      setUser(currentUser)
      return
    }

    removeMessagesById(_id)
    const initChat = async () => {
      setUserId(user.user_data._id)
      setRole(user.user_data.rol)
      try {
        const response = await getChats(_id, user.user_data._id)
        console.log('DEBUG', response)
        if (!prof) {
          // obtener datos desde los mensajes filtrando los que no tengan el id de user
          const mensajesFiltrados = response?.mensajes.filter((mensaje) => {
            return mensaje.sender_id !== user.user_data._id
          })
          const data = mensajesFiltrados[0]
          const profesional = {
            _id: data.sender_id,
            nombre: data.sender_name,
            apellido: data.sender_surname,
            foto_perfil: data.image,
          }
          console.log(data)
          setProf(profesional)
        }
        if (response?.mensajes.length === 0) {
          await recuperarConversacionEntreDosIds()
        }
        setMessages(response?.mensajes)
      } catch (error) {
        console.log(error)
      }
    }
    initChat()
  }, [user, _id, currentUser, setMessages, setUserId, setRole])

  const handleSend = useCallback(() => {
    if (!currentUser || !currentMessage.trim()) return

    const image_perfil = currentUser.user_data.foto_perfil

    const messageToSend = {
      sender_id: currentUser.user_data._id,
      receiver_id: prof._id,
      message: currentMessage,
      image: image_perfil,
      sender_name: currentUser.user_data.nombre,
      sender_surname: currentUser.user_data.apellido,
    }

    sendMessage(messageToSend)
    setCurrentMessage('')
    scrollToBottom()

    const PopMensajeSaliente = document.querySelector('#popMensajeSaliente')
    if (PopMensajeSaliente) {
      PopMensajeSaliente.volume = 0.3
      PopMensajeSaliente.play()
    }

    updateChats()
  }, [
    currentUser,
    prof,
    currentMessage,
    sendMessage,
    scrollToBottom,
    updateChats,
  ])

  const recuperarConversacionEntreDosIds = async () => {
    try {
      const new_response = await fetch(
        `/api/chat/last-message/between-two-users/${currentUser.user_data._id}/${_id}/`
      )
      const data = await new_response.json()
      console.log(data)
      if (data.success) {
        const {
          apellido,
          nombre,
          foto_perfil,
          conversacion_id,
          otro_participante,
        } = data
        localStorage.setItem(
          conversacion_id,
          JSON.stringify({
            _id: otro_participante,
            conversation_id: conversacion_id,
            nombre: nombre,
            apellido: apellido,
            foto_perfil: foto_perfil,
          })
        )
        router.replace(`/chatroom/${conversacion_id}`)
      }
    } catch (error) {
      console.log(error)
    }
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
              alt='Llamar'
            />
          </div>

          <div className={styles.chats} ref={containerRef}>
            {messages.map((message, index) => {
              const isOwn =
                message.sender_id === user.user_data._id ||
                message.id === user.user_data._id

              return (
                <p
                  key={index}
                  className={
                    isOwn ? styles.mensajeSaliente : styles.mensajeEntrante
                  }
                >
                  {message.message}
                  <span className={styles.hora}>
                    {obtenerHoraActual(message.timestamp)}
                  </span>
                </p>
              )
            })}
          </div>

          <div className={styles.containerInput}>
            <button
              className={styles.botonEnviar}
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Image src={EMOJI} height={30} alt='Emojis' />
            </button>

            <textarea
              maxLength={300}
              ref={textareaRef}
              className={styles.input}
              cols={18}
              autoFocus
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder='Escribe tu mensaje'
            />

            <button className={styles.botonEnviar} onClick={handleSend}>
              <Image src={SEND} alt='Enviar' height={30} />
            </button>

            <div className={styles.containerEmojis}>
              <EmojiPicker
                open={showEmojis}
                onEmojiClick={(e) =>
                  setCurrentMessage((prev) => prev + e.emoji)
                }
                emojiStyle='native'
                lazyLoadEmojis
                searchDisabled
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
