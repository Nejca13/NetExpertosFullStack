import Link from 'next/link'
import styles from './RubrosDropdown.module.css'
import { useState } from 'react'
import Image from 'next/image'
import iconMap from '@/constants/iconosProfesiones'

const RubrosDropdown = ({ item, index, _id }) => {
  const rubro = Object.keys(item)[0]
  const profesion = Object.values(item)[0]
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  return (
    <div
      key={index}
      className={[isOpen ? styles.containerOpen : styles.container]}
    >
      <button
        className={[isOpen ? styles.buttonOpen : styles.button]}
        onClick={() => setIsOpen(!isOpen)}
      >
        {rubro}
        <Image
          src={iconMap[rubro]}
          width={18}
          height={18}
          alt='icono profesion'
        />
      </button>
      {isOpen && (
        <ul className={styles.profesionUl}>
          {profesion.map((profesion, index) => (
            <li key={index} className={styles.li}>
              <Link
                className={styles.link}
                href={`/profile/${_id}/mapaBuscador/${encodeURIComponent(
                  profesion
                )}`}
                onClick={() => console.log('Cargando..')}
              >
                <p className={styles.p}>{profesion}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RubrosDropdown
