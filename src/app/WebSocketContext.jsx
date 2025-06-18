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

    ws.current.onopen = () => console.log('WebSocket connected')

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages((prev) => [...prev, data])
      // …tu localStorage…
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

  return (
    <WebSocketContext.Provider
      value={{ ws: ws.current, messages, setUserId, setRole }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext)
