import Image from 'next/image'
import styles from './ProfesionalCard.module.css'
import cross from '@/assets/images/cross-blanca.png'
import plus from '@/assets/images/iconPlusBlanco.png'
import ModalImg from './ModalImg/ModalImg'
import { useRef, useState } from 'react'
import estrellaGris from '@/assets/images/estrellaGris.svg'
import estrellaAmarilla from '@/assets/images/estrellaAmarilla.svg'
import CardInfoPersonal from '../CardInfoPersonal/CardInfoPersonal'
import { useRouter } from 'next/navigation'

const ProfesionalCard = ({ profesional, setIsShowPopup }) => {
  const [showModalImg, setShowModalImg] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [img, setImg] = useState(null)
  const router = useRouter()
  const audioRef = useRef(null)

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
    favoritos,
    horarios_atencion,
    recomendaciones,
  } = profesional
  const [favorite, setFavorite] = useState(favoritos)

  const modal = (img) => {
    setImg(img)
    setShowModalImg(true)
    return
  }

  const contactarProfesional = async () => {
    localStorage.setItem(
      profesional._id,
      JSON.stringify({
        nombre: nombre,
        apellido: apellido,
        foto_perfil: foto_perfil,
      })
    )

    router.push(`/chatroom/${profesional._id}`)
  }
  return showMoreInfo === true ? (
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
        <button
          className={styles.botonCerrar}
          onClick={() => setIsShowPopup(false)}
        >
          <Image width={25} height={25} src={cross} alt='boton cerrar' />
        </button>
        <div className={styles.containerImage}>
          <Image
            className={styles.image}
            src={foto_perfil}
            width={150}
            height={150}
            alt='foto del profesional'
          />
        </div>
        <div className={styles.containerInfo}>
          <p className={styles.pNombre}>{nombre}</p>
          <p className={styles.pProfesion}>{profesion_nombre}</p>
          <span className={styles.spanExperiencia}>
            Experiencia laboral - {experiencia_laboral_años} años
          </span>
        </div>
        <ul className={styles.ulValoracion}>
          <li className={styles.li}>
            {calificacion}
            <Image
              src={estrellaAmarilla}
              width={22}
              height={22}
              alt='icono estrella de valoracion'
            />
          </li>
          <li className={styles.li}>{recomendaciones} Reseñas</li>
          <li className={styles.li}>
            <button
              className={styles.buttonAgregarFavoritos}
              onClick={() => {
                const pop = document.querySelector('.audio')
                if (!favorite) {
                  pop.play()
                }
                setFavorite(!favorite)
              }}
            >
              {favorite ? (
                <>
                  <Image
                    src={estrellaAmarilla}
                    width={22}
                    height={22}
                    alt='icono estrella de valoracion'
                  />
                  Quitar de favoritos
                </>
              ) : (
                <>
                  <Image
                    src={estrellaGris}
                    width={22}
                    height={22}
                    alt='icono estrella de valoracion'
                  />
                  Agregar a favoritos
                </>
              )}
            </button>
          </li>
        </ul>
        <button
          className={styles.buttonMasInfo}
          onClick={() => setShowMoreInfo(true)}
        >
          <Image
            src={plus}
            width={23}
            height={23}
            className={styles.iconPlus}
            alt='icono plus'
          />

          <p style={{ width: '100%' }}>Informacion detallada del profesional</p>
        </button>
        <p className={styles.pTrabajosRealizados}>¡Trabajos realizados!</p>{' '}
        <ul className={styles.ulTrabajosRealizados}>
          {fotos_trabajos?.map((item, index) => (
            <li className={styles.li} key={index}>
              <Image
                className={styles.image}
                src={item.imagen_base64}
                width={70}
                quality={50}
                height={70}
                onClick={() => {
                  if (typeof item.imagen_base64 === 'string') {
                    modal(item.imagen_base64)
                  } else {
                    modal(item.imagen_base64.src)
                  }
                }}
                alt='fotos de trabajos realizados'
              />
              <p className={styles.p}>
                <strong>Titulo:</strong> {item.titulo}
              </p>
              <p className={styles.p}>
                <strong>Lugar:</strong> {item.lugar}
              </p>
              <p className={styles.p}>
                <strong>Fecha:</strong> {item.fecha}
              </p>
            </li>
          ))}
        </ul>
        <button
          className={styles.buttonContactar}
          onClick={contactarProfesional}
        >
          Contactar
        </button>
      </div>
    </section>
  )
}

export default ProfesionalCard
