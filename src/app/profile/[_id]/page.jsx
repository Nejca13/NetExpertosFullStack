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
import RubrosDropdown from '@/components/RubrosDropdown/RubrosDropdown'
import { useParams } from 'next/navigation'
import { searchFunction } from './searchFunction'
import Destacados from '@/components/Map/Destacados/Destacados'
import { useShowProfesionalCard } from '@/app/profesionalCardContext'
import ProfesionalCard from '@/components/ProfesionalCard/ProfesionalCard'
import NotificacionChat from '@/components/NotificacionChat/NotificacionChat'
import useStore from '@/store/store'
import { useWebSocket } from '@/app/WebSocketContext'
import Search from '@/assets/icon/Search'

const Page = () => {
  const { ws, messages, setUserId, setRole } = useWebSocket()
  const [showMenu, setShowMenu] = useState(false)
  const [userApp, setUserApp] = useState({})
  const [searchItems, setSearchItems] = useState('')
  const { _id } = useParams()
  const [showProfesionalCard, setShowProfesionalCard] = useShowProfesionalCard()
  const [notificationMessages, setNotificationMessages] = useState([])
  const { currentUser, setCurrentUser } = useStore()

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
    if (currentUser) {
      if (messages.length > 0) {
        setNotificationMessages(messages)
      }
      setTimeout(() => {
        setNotificationMessages([])
      }, 5000)
    }
    //console.log('Mensaje recibido')
    const data = messages[messages.length - 1]
    if (data?.message) {
      sendAndroidNotification(
        'NetExpertos',
        `${data.name}: ${data.message}`,
        data.image
      )
    }
    return () => {
      setNotificationMessages([])
    }
  }, [messages, ws])

  const fetchUserData = async () => {
    const user = currentUser
    setUserApp(user.user_data)
    setUserId(user.user_data._id)
    setRole(user.user_data.rol)
  }

  return (
    <ContainerBlanco>
      {notificationMessages.length > 0 ? (
        <NotificacionChat
          currentUser={userApp}
          message={notificationMessages}
          setNotificationMessages={setNotificationMessages}
        />
      ) : null}
      {showMenu && <HambMenu show={() => setShowMenu(!showMenu)} />}

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
          <Search width='20px' height='20px' />
        </div>
        <input
          className={styles.searchInput}
          type='search'
          onChange={(e) => {
            if (e.target.value === '') {
              setSearchItems('')
            }
            setTimeout(() => {
              setSearchItems(e.target.value)
            }, 300)
          }}
        />
      </div>
      <div className={styles.divCategorias}>
        {searchFunction(searchItems).map((item, index) => (
          <RubrosDropdown
            item={item}
            index={index}
            key={index}
            _id={_id}
            forceOpen={!!searchItems}
          />
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
