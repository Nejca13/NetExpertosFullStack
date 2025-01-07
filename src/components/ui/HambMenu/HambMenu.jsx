import Image from 'next/image'
import styles from './HambMenu.module.css'
import cross from '@/assets/images/cross.png'
import defaultImage from '@/assets/images/userImage.png'
import { userLogout } from '@/services/api/authUsuarios'
import {
  hambMenuOptionsClient,
  hambMenuOptionsExpert,
} from '@/constants/hambMenu'
import MenuPerfil from './Perfil/MenuPerfil'
import { useState, useEffect, useRef } from 'react'
import ConvertiteEnExperto from './ConvertiteEnExperto/ConvertiteEnExperto'
import { useRouter } from 'next/navigation'
import NotificationBubble from '../NotificationBubble/NotificationBubble'

const HambMenu = ({ show, userApp }) => {
  const [menuComponent, setMenuComponent] = useState(null)
  const containerRef = useRef(null)
  const router = useRouter()

  const handleOptionClick = (name) => {
    switch (name) {
      case 'Perfil':
        setMenuComponent(
          <MenuPerfil setMenuComponent={setMenuComponent} user={userApp} />
        )
        break
      case 'Quiero ser un experto':
        setMenuComponent(
          <ConvertiteEnExperto
            setMenuComponent={setMenuComponent}
            user={userApp}
          />
        )
        break
      case 'Mensajes':
        router.push(`/profile/${userApp._id}/${userApp.rol}/chats`)
        break
      case 'Salir':
        userLogout()
      default:
        break
    }
  }

  const handleOutsideClick = (event) => {
    if (
      menuComponent === null &&
      containerRef.current &&
      !containerRef.current.contains(event.target)
    ) {
      show()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [menuComponent])

  return (
    <div className={styles.container}>
      <div className={styles.menu} ref={containerRef}>
        <div className={styles.personalMenu}>
          <button onClick={show} className={styles.button}>
            <Image src={cross} width={30} height={30} alt='Icono de cerrar' />
          </button>
          <div className={styles.div}>
            <Image
              className={styles.image}
              src={
                userApp
                  ? userApp.foto_base64 || userApp.foto_perfil
                  : defaultImage.src
              }
              width={60}
              height={60}
              alt='Imagen de perfil del usuario'
            />
            <div className={styles.divText}>
              <p className={styles.name}>¡Hola, {userApp.nombre}!</p>
              <p className={styles.email}>{userApp.correo}</p>
            </div>
          </div>
        </div>
        <div className={styles.menuConfig}>
          <ul className={styles.ul}>
            {userApp.rol === 'Profesional'
              ? hambMenuOptionsExpert.map((item, index) => (
                  <li
                    className={styles.li}
                    key={index}
                    onClick={() => handleOptionClick(item.name)}
                  >
                    <Image
                      className={styles.icon}
                      src={item.icon}
                      width={24}
                      height={24}
                      alt={`Icono de ${item.name}`}
                    />{' '}
                    <span>{item.name}</span>
                    {item.name === 'Mensajes' && <NotificationBubble />}
                  </li>
                ))
              : hambMenuOptionsClient.map((item, index) => (
                  <li
                    className={styles.li}
                    key={index}
                    onClick={() => handleOptionClick(item.name)}
                  >
                    <Image
                      className={styles.icon}
                      src={item.icon}
                      width={24}
                      height={24}
                      alt={`Icono de ${item.name}`}
                    />{' '}
                    <span>{item.name}</span>{' '}
                    {item.name === 'Mensajes' && <NotificationBubble />}
                  </li>
                ))}
          </ul>
        </div>
      </div>
      {menuComponent}
    </div>
  )
}

export default HambMenu
