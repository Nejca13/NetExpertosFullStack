'use client'
import Image from 'next/image'
import styles from './ProfesionalCard.module.css'
import cross from '@/assets/images/cross-blanca.png'
import ModalImg from './ModalImg/ModalImg'
import { useRef, useState } from 'react'
import estrellaGris from '@/assets/images/estrellaGris.svg'
import estrellaAmarilla from '@/assets/images/estrellaAmarilla.svg'
import CardInfoPersonal from '../CardInfoPersonal/CardInfoPersonal'
import { useRouter } from 'next/navigation'
import Calificacion from '../Calificacion/Calificacion'
import IconInfo from '@/assets/icon/IconInfo'
import Verify from '@/assets/icon/Verify'
import Url from '@/assets/icon/Url'

const ProfesionalCard = ({ profesional, setIsShowPopup }) => {
  const [showModalImg, setShowModalImg] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [img, setImg] = useState(null)
  const [favorite, setFavorite] = useState(profesional.favoritos)
  const audioRef = useRef(null)
  const router = useRouter()

  // Verifica si el profesional esta verificado por ahora hasta que tenga lo tenga el backend
  const [verify, setVerify] = useState(true)

  const {
    _id,
    calificacion,
    acerca_de_mi,
    apellido,
    correo,
    experiencia_laboral_años,
    nombre,
    fotos_trabajos,
    rubro_nombre,
    profesion_nombre,
    nacimiento,
    numero,
    foto_perfil,
    horarios_atencion,
    recomendaciones,
  } = profesional

  const modal = (img) => {
    setImg(img)
    setShowModalImg(true)
  }

  const contactarProfesional = () => {
    localStorage.setItem(
      profesional._id,
      JSON.stringify({
        _id: profesional._id,
        nombre: nombre,
        apellido: apellido,
        foto_perfil: foto_perfil,
      })
    )
    router.push(`/chatroom/${profesional._id}`)
  }

  return showMoreInfo ? (
    <CardInfoPersonal
      profesional={profesional}
      setShowMoreInfo={setShowMoreInfo}
    />
  ) : (
    <section className={styles.backgroundCard}>
      <audio className='audio' src={'/sounds/Pop2.mp3'} ref={audioRef}></audio>
      {showModalImg && (
        <ModalImg image={img} setShowModalImg={setShowModalImg} />
      )}

      <div className={styles.container}>
        {/* Botones fav y close */}
        <div className={styles.closeAndFavButton}>
          <button
            className={styles.buttonAgregarFavoritos}
            onClick={() => {
              const pop = document.querySelector('.audio')
              if (!favorite) pop.play()
              setFavorite(!favorite)
            }}
          >
            <Image
              src={favorite ? estrellaAmarilla : estrellaGris}
              width={25}
              height={25}
              alt='icono estrella de valoracion'
            />
          </button>
          <button
            className={styles.botonCerrar}
            onClick={() => setIsShowPopup(false)}
          >
            <Image width={18} height={18} src={cross} alt='boton cerrar' />
          </button>
        </div>
        {/* Encabezado del perfil */}
        <div className={styles.header_profile}>
          <div className={styles.containerImage}>
            <Image
              className={`${styles.image} ${verify ? styles.verify : ''}`}
              src={foto_perfil}
              width={130}
              height={130}
              alt='foto del profesional'
            />
            <i className={styles.icon}>
              <Verify
                width='30px'
                height='30px'
                color={verify ? '#319bff' : 'rgb(227, 227, 227)'}
              />
            </i>
          </div>

          <div className={styles.containerInfo}>
            <p className={styles.pNombre}>{nombre}</p>
            <p className={styles.pProfesion}>{profesion_nombre}</p>
            <span className={styles.spanExperiencia}>
              Experiencia laboral - {experiencia_laboral_años} años
            </span>
          </div>

          <div className={styles.rating}>
            <div className={styles.calificacion}>
              <Calificacion rating={calificacion} />
              <span style={{ color: 'black' }}>{calificacion}</span>
              <span className={styles.reseñas}>
                ({recomendaciones}) Reseñas
                <Url color='black' width='18px' height='18px' />
              </span>
            </div>
          </div>

          <div className={styles.containerRubro}>
            <button
              className={styles.buttonMasInfo}
              onClick={() => setShowMoreInfo(true)}
            >
              <IconInfo width='16px' height='16px' color='white' />
              Mas informacion del profesional
            </button>
          </div>
        </div>
        <div className={styles.containerTrabajos}>
          <div className={styles.container_title_button}>
            <span>¡Trabajos realizados!</span>
            <button>Ver más</button>
          </div>

          <ul className={styles.ulTrabajosRealizados}>
            {fotos_trabajos?.slice(0, 4).map((item, index) => (
              <li className={styles.li} key={index}>
                <Image
                  className={styles.image}
                  src={item.foto}
                  width={65}
                  quality={50}
                  height={65}
                  onClick={() => modal(item.foto)}
                  alt='fotos de trabajos realizados'
                />
                <p className={styles.p}>{item.titulo}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.containerButton}>
          <button onClick={contactarProfesional}>Contactar</button>
        </div>{' '}
      </div>
    </section>
  )
}

export default ProfesionalCard
