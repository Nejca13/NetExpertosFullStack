'use client'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { useParams, useRouter } from 'next/navigation'
import { getLastMessages } from '@/services/api/chat'
import { useWebSocket } from '@/app/WebSocketContext'
import Image from 'next/image'
import MessagesCard from '@/components/MessagesCard/MessagesCard'

const Page = () => {
  const { _id, rol } = useParams()
  const [conversaciones, setConversaciones] = useState([])
  const [receiverID, setReceiverID] = useState(null)
  const { ws, messages, setUserId, setRole } = useWebSocket()
  const router = useRouter()

  useEffect(() => {
    if (_id) {
      console.log('[Chat] ID del usuario:', _id)
      console.log('[Chat] Rol del usuario:', rol)
      setUserId(_id)
      setRole(rol)

      console.log('[Chat] Fetching últimos mensajes...')
      getLastMessages(_id)
        .then((response) => {
          const ultimos = response?.ultimos_mensajes || []
          console.log('[Chat] Mensajes obtenidos:', ultimos)
          setConversaciones(ultimos)
          setReceiverID(ultimos[0]?.otro_participante)
        })
        .catch((err) => {
          console.error('[Chat] Error al obtener mensajes:', err)
        })
    } else {
      console.warn('[Chat] No hay _id disponible en useParams')
    }
  }, [messages])

  useEffect(() => {
    if (ws) {
      console.log('[Chat] WebSocket activo:', ws?.readyState)
    } else {
      console.warn('[Chat] WebSocket aún no disponible')
    }
  }, [ws])

  return (
    <>
      <div className={styles.container}>
        <div className={styles.containerTitle}>
          <Image
            className={styles.flechaAtras}
            src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABYklEQVR4nO2YsUrDQBiAvxJ0cHLRp3Bxk9AsfQyHDAkFoWTqO/g++gAOxcmHyKTgZoKILsnJQQuhTW0uNO3/y31w2w3fB3/ukoDH4/H8B+6Ab8AA78AVipgvxZvLRuiSn06nJs/zZoR4stFoVFvZNE1NVVXGoiUga5PXEpBtk9cQkP0lLz1gtktecsAM2CkvNWDePCrrut4qvxYwxHoeVN4yHo+Hjtj/2BwCHANEybsGiJN3Cbh1nXlpAR92UxzHouS7BpzZDUEQmLIsjTToEHCxCiiKwmgMOF9t0jpCJ0Cl/SF+at56SZKoO0avgS+JEThcZBHw2Yw49jgtFgvnV4neEWEYinmZi/pEDCz/hiMT12di4IB714DWiI6flPtcr0v5U3qyMU4aP+qjLhGSAzpFSA/YGaEhYOsRq+3nbrQe0ffCOSYbR+xy/aCISUvEI8q4AV6AEngALo8t5PF4PByEX602SwjUn4tkAAAAAElFTkSuQmCC'
            width={35}
            height={35}
            alt='Flecha atras'
            onClick={() => {
              console.log(
                '[Chat] Volviendo atrás, eliminando localStorage:',
                _id
              )
              localStorage.removeItem(_id)
              router.back()
            }}
          />
          <h2 className={styles.title}>NetExpChats</h2>
        </div>
        <ul className={styles.ul}>
          {conversaciones.length > 0 &&
            conversaciones?.map((item, index) => {
              console.log(`[Chat] Render mensaje index ${index}`, item)
              return (
                <MessagesCard
                  key={index}
                  item={item}
                  index={index}
                  _id={receiverID}
                />
              )
            })}
        </ul>
      </div>
    </>
  )
}

export default Page
