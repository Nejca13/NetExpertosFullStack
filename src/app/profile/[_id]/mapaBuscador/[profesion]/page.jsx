'use client'
import { useEffect, useState } from 'react'
import useGeolocation from '@/hooks/useGeolocation'
import MapComponent from '@/components/Map'
import styles from './page.module.css'
import Link from 'next/link'
import HambMenu from '@/components/ui/HambMenu/HambMenu'
import HambIcon from '@/components/ui/HambIcon/HambIcon'
import { useParams } from 'next/navigation'
import { getFilteredAndSortedProfessionalsByDistance } from '@/services/api/profesionales'
import isAuth from '@/components/Auth/IsAuth'
import SimpleLoader from '@/components/Loaders/SimpleLoader'
import ProfesionalCard from '@/components/ProfesionalCard/ProfesionalCard'
import { getUser } from '@/utils/indexedDataBase'
import ContainerBlanco from '@/components/Containers/ContainerFondoBlanco'
import Destacados from '@/components/Map/Destacados/Destacados'
import Image from 'next/image'
import Lupa from '@/assets/images/LUPA_NEGRA.svg'
import { useWebSocket } from '@/app/WebSocketContext'
import NotificacionChat from '@/components/NotificacionChat/NotificacionChat'

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
  const { ws, messages, setUserId, setRole } = useWebSocket()
  const [notificationMessages, setNotificationMessages] = useState([])

  const setUser = async () => {
    const storageUser = await getUser(_id)
    setUserApp(storageUser.user_data)
    setUserId(storageUser.user_data._id)
    setRole(storageUser.user_data.rol)
  }

  useEffect(() => {
    setUser()
    if (location) {
      setCoord([location.latitude, location.longitude])
      setLoading(true)
      getFilteredAndSortedProfessionalsByDistance(
        {
          profesion: profesion,
          latitud: location.latitude,
          longitud: location.longitude,
          kilometrosDeRadio: kilometrosDeRadio,
        },
        setErrorMsg
      )
        .then((res) => {
          setProfessionalsNearby(res)
          setLoading(false)
        })
        .catch((error) => {
          setErrorMsg('Hubo un error al cargar los profesionales cercanos.')
          setLoading(false)
        })
    }
  }, [location])
  useEffect(() => {
    if (userApp) {
      if (messages.length > 0) {
        setNotificationMessages(messages)
      }
      setTimeout(() => {
        setNotificationMessages([])
      }, 5000)
    }
  }, [messages])
  useEffect(() => {
    if (location) {
      getFilteredAndSortedProfessionalsByDistance(
        {
          profesion: profesion,
          latitud: location.latitude,
          longitud: location.longitude,
          kilometrosDeRadio: kilometrosDeRadio,
        },
        setErrorMsg
      )
        .then((res) => {
          setProfessionalsNearby(res)
          setLoading(false)
        })
        .catch((error) => {
          setErrorMsg('Hubo un error al cargar los profesionales cercanos.')
          setLoading(false)
        })
    }
  }, [kilometrosDeRadio])

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
          <h3
            style={{
              alignContent: 'center',
              margin: 'auto',
              fontFamily: 'var(--font-roboto-bold)',
              textAlign: 'center',
            }}
          >
            <SimpleLoader />
          </h3>
        </ContainerBlanco>
      )
    } else {
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
                  No se encontro ningun {decodeURIComponent(profesion)}
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
  }

  return (
    <div className={styles.containerMap}>
      {notificationMessages.length > 0 ? (
        <NotificacionChat
          message={notificationMessages}
          setNotificationMessages={setNotificationMessages}
        />
      ) : null}
      {show && <HambMenu userApp={userApp} show={() => setShow(!show)} />}
      <div className={styles.menu}>
        <HambIcon
          userApp={userApp}
          messages={messages}
          show={() => {
            setShow(!show)
          }}
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
        <Image src={Lupa} width={20} height={20} alt='icono lupa' /> Buscar
      </Link>
    </div>
  )
}

export default isAuth(Map)
