'use client'
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'

const WebSocketContext = createContext(null)

export const WebSocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [userId, setUserId] = useState(null)
  const [role, setRole] = useState(null)
  const ws = useRef(null)

  useEffect(() => {
    if (userId && role) {
      connectWebSocket(userId, role)
      console.log('conectando')
    }
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [userId])

  const connectWebSocket = (id, role) => {
    ws.current = new WebSocket(
      `wss://vps-4057595-x.dattaweb.com/chat/ws/${id}/${role}`
    )

    ws.current.onopen = () => {
      console.log('WebSocket connected')
    }

    const addMessageToLocalStorage = (data) => {
      try {
        const storedMessages =
          JSON.parse(localStorage.getItem('messages')) || {}

        const newMessage = {
          id: data.id,
          message: data.message,
          name: data.name,
          surname: data.surname,
        }

        if (storedMessages[data.id]) {
          // Si ya existen mensajes para este id, añade el nuevo mensaje al array existente
          storedMessages[data.id].push(newMessage)
        } else {
          // Si no existen mensajes para este id, crea un nuevo array con el nuevo mensaje
          storedMessages[data.id] = [newMessage]
        }

        localStorage.setItem('messages', JSON.stringify(storedMessages))
      } catch (error) {
        console.error('Error al manejar localStorage:', error)
      }
    }

    // Función para manejar el evento de recepción de mensajes
    const handleMessageEvent = (event) => {
      try {
        const data = JSON.parse(event.data)
        addMessageToLocalStorage(data)
        setMessages((prevMessages) => [...prevMessages, data])
      } catch (error) {
        console.error('Error al procesar el mensaje:', error)
      }
    }
    ws.current.onmessage = handleMessageEvent

    ws.current.onclose = () => {
      console.log('WebSocket disconnected')
      // Try to reconnect in 5 seconds
      setTimeout(() => connectWebSocket(id), 5000)
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      ws.current.close()
    }
  }

  return (
    <WebSocketContext.Provider
      value={{ ws: ws.current, messages, setUserId, setMessages, setRole }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  return useContext(WebSocketContext)
}
