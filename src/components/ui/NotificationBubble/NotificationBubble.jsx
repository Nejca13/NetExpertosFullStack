import { useEffect, useState } from 'react'
import styles from './NotificationBubble.module.css'
import { useWebSocket } from '@/app/WebSocketContext'

const NotificationBubble = () => {
  const { messages } = useWebSocket()
  const [notifications, setNotifications] = useState(false)
  useEffect(() => {
    try {
      const mensajes = localStorage.getItem('messages')
      if (mensajes) {
        const mensajesNoLeidos = JSON.parse(mensajes)
        if (mensajesNoLeidos && Object.keys(mensajesNoLeidos).length > 0) {
          setNotifications(true)
        } else {
          setNotifications(false)
        }
      } else {
        setNotifications(false)
      }
    } catch (error) {
      console.error('Error al leer mensajes de localStorage:', error)
      setNotifications(false)
    }
  }, [messages])
  return notifications ? <div className={styles.container}></div> : null
}

export default NotificationBubble
