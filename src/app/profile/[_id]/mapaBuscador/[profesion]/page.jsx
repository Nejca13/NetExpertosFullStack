'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import MapComponent from '@/components/Map'
import styles from './page.module.css'
import Link from 'next/link'
import HambMenu from '@/components/ui/HambMenu/HambMenu'
import HambIcon from '@/components/ui/HambIcon/HambIcon'
import SimpleLoader from '@/components/Loaders/SimpleLoader'
import ProfesionalCard from '@/components/ProfesionalCard/ProfesionalCard'
import ContainerBlanco from '@/components/Containers/ContainerFondoBlanco'
import Destacados from '@/components/Map/Destacados/Destacados'
import Image from 'next/image'
import Lupa from '@/assets/images/LUPA_NEGRA.svg'
import NotificacionChat from '@/components/NotificacionChat/NotificacionChat'
import { getFilteredAndSortedProfessionalsByDistance } from '@/services/api/profesionales'
import isAuth from '@/components/Auth/IsAuth'
import { useWebSocket } from '@/app/WebSocketContext'
import useStore from '@/store/store'
<<<<<<< HEAD
import useGeolocation from '@/hooks/useGeolocation'
=======
import Search from '@/assets/icon/Search'
>>>>>>> 48c7191 (Update color variable for consistency, add Search icon to profile page, and implement Calificacion component for rating display)

const Map = () => {
  const { profesion, _id } = useParams()
  const { location, error } = useGeolocation()

  const [userApp, setUserApp] = useState({})
  const [coord, setCoord] = useState(null)
  const [show, setShow] = useState(false)
  const [professionalsNearby, setProfessionalsNearby] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [isShowPopup, setIsShowPopup] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [kilometrosDeRadio, setKilometrosDeRadio] = useState(15)
  const [notificationMessages, setNotificationMessages] = useState([])

  const { ws, messages, setUserId, setRole } = useWebSocket()
  const { currentUser } = useStore()

  useEffect(() => {
    setUserApp(currentUser?.user_data)
    setUserId(currentUser?.user_data._id)
    setRole(currentUser?.user_data.rol)
  }, [])

  useEffect(() => {
    if (location) {
      setCoord([location.latitude, location.longitude])
      setLoading(true)
      getFilteredAndSortedProfessionalsByDistance(
        {
          profesion,
          latitud: location.latitude,
          longitud: location.longitude,
          kilometrosDeRadio,
        },
        setErrorMsg
      )
        .then(setProfessionalsNearby)
        .finally(() => setLoading(false))
    }
  }, [location])

  useEffect(() => {
    if (location) {
      getFilteredAndSortedProfessionalsByDistance(
        {
          profesion,
          latitud: location.latitude,
          longitud: location.longitude,
          kilometrosDeRadio,
        },
        setErrorMsg
      )
        .then(setProfessionalsNearby)
        .finally(() => setLoading(false))
    }
  }, [kilometrosDeRadio])

  useEffect(() => {
    if (messages.length > 0) {
      setNotificationMessages(messages)
      setTimeout(() => setNotificationMessages([]), 5000)
    }
  }, [messages])

  const kilometros = {
    18: 5,
    17: 10,
    16: 20,
    15: 35,
    14: 55,
    13: 80,
    12: 120,
    11: 180,
    10: 250,
    9: 350,
    8: 500,
    7: 650,
    6: 800,
    5: 1000,
    4: 1000,
    3: 1000,
    2: 1000,
    1: 1000,
  }

  const renderMapComponent = () => {
    if (loading) {
      return (
        <ContainerBlanco>
          <h3 className={styles.loadingTitle}>
            <SimpleLoader />
          </h3>
        </ContainerBlanco>
      )
    }

    return (
      <div className={styles.containerMap}>
        <MapComponent
          coord={coord}
          profesionales={professionalsNearby.profesionales_cercanos}
          setIsShowPopup={setIsShowPopup}
          setKilometrosDeRadio={setKilometrosDeRadio}
        />
        <>
          {errorMsg && (
            <div className={styles.errorMessage}>
              <SimpleLoader />
              <p className={styles.p}>
                No se encontró ningún {decodeURIComponent(profesion)}
                <p className={styles.e}>
                  Buscando en un radio de {kilometros[kilometrosDeRadio]} Km
                </p>
              </p>
            </div>
          )}
          {error && (
            <div className={styles.errorMessage}>
              <p className={styles.p}>
                Para poder usar la aplicación debes activar la ubicación
                <p className={styles.e}>
                  Buscando en un radio de {kilometros[kilometrosDeRadio]} Km
                </p>
              </p>
            </div>
          )}
        </>
      </div>
    )
  }

  return (
    <div className={styles.containerMap}>
      {notificationMessages.length > 0 && (
        <NotificacionChat
          message={notificationMessages}
          setNotificationMessages={setNotificationMessages}
        />
      )}
      {show && <HambMenu userApp={userApp} show={() => setShow(!show)} />}
      <div className={styles.menu}>
        <HambIcon
          userApp={userApp}
          messages={messages}
          show={() => setShow(!show)}
        />
      </div>
      {isShowPopup && (
        <ProfesionalCard
          profesional={isShowPopup.profesional}
          setIsShowPopup={setIsShowPopup}
        />
      )}
      {renderMapComponent()}
      <Destacados setIsShowPopup={setIsShowPopup} />
      <Link href={`/profile/${_id}`} className={styles.button}>
        <Search stroke='3.5' width='18px' height='18px' color='black' />
        Buscar
      </Link>
    </div>
  )
}

export default isAuth(Map)
