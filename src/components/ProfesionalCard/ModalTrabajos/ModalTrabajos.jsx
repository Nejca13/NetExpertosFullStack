'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './ModalTrabajos.module.css'
import LuChevronLeft from '@/assets/icon/LuChevronLeft'
import LuChevronRight from '@/assets/icon/LuChevronRight'

const ModalTrabajos = ({ fotos_trabajos = [] }) => {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollPosition = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
  }

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth
    el.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    checkScrollPosition()
    el.addEventListener('scroll', checkScrollPosition)

    return () => {
      el.removeEventListener('scroll', checkScrollPosition)
    }
  }, [])

  if (!fotos_trabajos.length) return null

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button_left}
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
      >
        <LuChevronLeft color='black' />
      </button>

      <ul className={styles.trabajos_modal} ref={scrollRef}>
        {fotos_trabajos.map((item, index) => (
          <li className={styles.li} key={index}>
            <Image
              className={styles.image}
              src={item.foto}
              width={300}
              quality={50}
              height={150}
              alt='fotos de trabajos realizados'
            />
          </li>
        ))}
      </ul>

      <button
        className={styles.button_rigth}
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
      >
        <LuChevronRight color='black' />
      </button>
    </div>
  )
}

export default ModalTrabajos
