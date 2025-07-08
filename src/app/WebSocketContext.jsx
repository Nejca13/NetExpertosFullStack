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
      const cleanup = connectWebSocket(userId, role)
      console.log('conectando', { userId, role })
      return cleanup
    }
  }, [userId, role])

  const connectWebSocket = (id, role) => {
    const url =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_WSS_URL
        : process.env.NEXT_PUBLIC_WS_URL

    ws.current = new WebSocket(`${url}/${id}/${role}/`)

    console.log(`${url}/${id}/${role}/`)

    ws.current.onopen = () => console.log('WebSocket connected')

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages((prev) => [...prev, data])

      const { conversation_id, text, sender_name, sender_image } = data

      const currentPath = window.location.pathname
      console.log(currentPath)
      const isCurrentChat = currentPath.includes(`/chatroom/${conversation_id}`)

      if (!isCurrentChat) {
        if (window.Android?.sendNotification) {
          window.Android.sendNotification(sender_name, text, sender_image || '')
        } else {
          console.log('Android interface not available.')
        }
      }
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected — reconectando en 5s')
      setTimeout(() => connectWebSocket(id, role), 5000)
    }

    ws.current.onerror = (err) => {
      console.error('WebSocket error:', err)
      ws.current.close()
    }

    // cleanup handler
    return () => ws.current?.close()
  }

  const sendMessage = (msgObject) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msgObject)) // 🚨 NECESARIO
      console.log('Mensaje enviado:', msgObject)
    } else {
      console.warn('WebSocket no está listo')
    }
  }

  return (
    <WebSocketContext.Provider
      value={{
        ws,
        messages,
        setUserId,
        setRole,
        setMessages,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext)
