'use client'
import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { useParams, useRouter } from 'next/navigation'
import { getAllConversations } from '@/services/api/chat'
import { useWebSocket } from '@/app/WebSocketContext'
import Image from 'next/image'
import MessagesCard from '@/components/MessagesCard/MessagesCard'

const Page = () => {
  const { _id, rol } = useParams()
  const [conversaciones, setConversaciones] = useState([])
  const { ws, messages, setUserId, setRole } = useWebSocket()
  const router = useRouter()

  useEffect(() => {
    if (_id) {
      setUserId(_id)
      setRole(rol)
      getAllConversations(_id).then((response) => {
        // Expresión regular para verificar el patrón del _id
        const idPattern =
          /^[a-f0-9]{24}_[a-f0-9]{24}_[0-9]{4}-[0-9]{2}-[0-9]{2}$/

        // Filtramos las conversaciones para excluir las que no cumplen con las condiciones
        const filteredConversations = response.conversaciones.filter(
          (conversation) => {
            const [participant1, participant2] = conversation.participantes
            return (
              idPattern.test(conversation._id) &&
              !(participant1 === _id && participant2 === _id) &&
              !(participant1.length <= 0 && participant2.length <= 0) &&
              participant1 !== '' &&
              participant2 !== '' &&
              participant1 !== undefined &&
              participant2 !== undefined
            )
          }
        )

        // Ordenamos las conversaciones por la fecha del último mensaje de cada conversación
        const sortedConversations = filteredConversations
          .map((conversation) => ({
            ...conversation,
            mensajes: conversation.mensajes.sort(
              (a, b) => new Date(b.time) - new Date(a.time)
            ),
          }))
          .sort(
            (a, b) =>
              new Date(b.mensajes[0].time) - new Date(a.mensajes[0].time)
          )

        // Crear un mapa para almacenar la conversación más reciente para cada par de participantes
        const recentConversationsMap = new Map()

        sortedConversations.forEach((conversation) => {
          const [participant1, participant2] = conversation.participantes.sort() // Ordenar los participantes para un identificador único
          const key = `${participant1}-${participant2}`
          if (
            !recentConversationsMap.has(key) ||
            new Date(conversation.mensajes[0].time) >
              new Date(recentConversationsMap.get(key).mensajes[0].time)
          ) {
            recentConversationsMap.set(key, conversation)
          }
        })

        // Convertimos el mapa a un array de conversaciones recientes
        const recentConversations = Array.from(recentConversationsMap.values())

        setConversaciones(recentConversations)
      })
    }
  }, [messages])

  const getInfo = (mensajes) => {
    const id = mensajes.filter((mensaje, index) => mensaje.remitente_id !== _id)
    return id[0]
  }

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
              localStorage.removeItem(_id)
              router.back()
            }}
          />
          <h2 className={styles.title}>NetExpChats</h2>
        </div>
        <ul className={styles.ul}>
          {conversaciones.length > 0 &&
            conversaciones.map(
              (item, index) =>
                getInfo(item.mensajes)?.remitente_id !== undefined && (
                  <MessagesCard
                    item={item}
                    index={index}
                    _id={_id}
                    key={index}
                  />
                )
            )}
        </ul>
      </div>
    </>
  )
}

export default Page
