'use client'

import ContainerBlanco from '@/components/Containers/ContainerFondoBlanco'
import Image from 'next/image'
import LogoNetExpertos from '@/components/ui/Logo/LogoNetExpertos'
import styles from './page.module.css'
import lupa from '@/assets/images/LUPA.svg'
import HambMenu from '@/components/ui/HambMenu/HambMenu'
import { useEffect, useState } from 'react'
import HambIcon from '@/components/ui/HambIcon/HambIcon'
import isAuth from '@/components/Auth/IsAuth'
import { getUser } from '@/utils/indexedDataBase'
import RubrosDropdown from '@/components/RubrosDropdown/RubrosDropdown'
import { useParams } from 'next/navigation'
import { searchFunction } from './searchFunction'
import Destacados from '@/components/Map/Destacados/Destacados'
import { useShowProfesionalCard } from '@/app/profesionalCardContext'
import ProfesionalCard from '@/components/ProfesionalCard/ProfesionalCard'
import { useWebSocket } from '@/app/WebSocketContext'
import NotificacionChat from '@/components/NotificacionChat/NotificacionChat'

const Page = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [userApp, setUserApp] = useState({})
  const [searchItems, setSearchItems] = useState('')
  const { _id } = useParams()
  const [showProfesionalCard, setShowProfesionalCard] = useShowProfesionalCard()
  const { ws, messages, setUserId, setRole } = useWebSocket()
  const [notificationMessages, setNotificationMessages] = useState([])

  useEffect(() => {
    fetchUserData()
  }, [])
  const sendAndroidNotification = (title, message, imageUrl) => {
    if (window.Android && typeof Android.sendNotification === 'function') {
      Android.sendNotification(title, message, imageUrl)
    } else {
      console.log('Android interface not available.')
    }
  }

  useEffect(() => {
    if (userApp) {
      if (messages.length > 0) {
        setNotificationMessages(messages)
      }
      setTimeout(() => {
        setNotificationMessages([])
      }, 5000)
    }
    console.log('Mensaje recibido')
    const data = messages[messages.length - 1]
    if (data?.message) {
      sendAndroidNotification(
        'NetExpertos',
        `${data.name}: ${data.message}`,
        atob(data.image)
      )
    }
    return () => {
      setNotificationMessages([])
    }
  }, [messages])

  const fetchUserData = async () => {
    const user = await getUser(_id)
    setUserApp(user.user_data)
    setUserId(user.user_data._id)
    setRole(user.user_data.rol)
  }

  return (
    <ContainerBlanco>
      {notificationMessages.length > 0 ? (
        <NotificacionChat
          message={notificationMessages}
          setNotificationMessages={setNotificationMessages}
        />
      ) : null}
      {showMenu && (
        <HambMenu userApp={userApp} show={() => setShowMenu(!showMenu)} />
      )}

      <div className={styles.divNavBar}>
        <LogoNetExpertos width={200} height={70} />
        <HambIcon
          userApp={userApp}
          messages={messages}
          show={() => {
            setShowMenu(!showMenu)
          }}
        />
      </div>
      <div className={styles.divBuscador}>
        <div className={styles.logoLupa}>
          <Image
            className={styles.lupa}
            src={lupa}
            width={20}
            height={20}
            alt='Lupa Buscador'
          />
        </div>
        <input
          className={styles.searchInput}
          type='search'
          onChange={(e) =>
            setTimeout(() => {
              setSearchItems(e.target.value)
            }, 300)
          }
        />
      </div>
      <div className={styles.divCategorias}>
        {searchFunction(searchItems).map((item, index) => (
          <RubrosDropdown item={item} index={index} key={index} _id={_id} />
        ))}
      </div>
      <div className={styles.destacados}>
        <Destacados />
        {showProfesionalCard && (
          <ProfesionalCard
            profesional={showProfesionalCard.profesional}
            setIsShowPopup={setShowProfesionalCard}
          />
        )}
      </div>
    </ContainerBlanco>
  )
}

export default isAuth(Page)
