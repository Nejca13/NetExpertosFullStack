import React, { useState, useRef } from 'react'
import styles from './SlideToUnlock.module.css'
import Forward from '@/assets/images/ICONOS/ICO-FORWARD.svg'
import Image from 'next/image'
import Calendar from 'react-calendar'
import './Calendar.css'
const SlideToUnlock = () => {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isEndReached, setIsEndReached] = useState(false)
  const sliderRef = useRef(null)
  const containerRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [offsetX, setOffsetX] = useState(0)

  const handleMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    setStartX(e.clientX - sliderRef.current.getBoundingClientRect().left)
  }

  const handleMouseMove = (e) => {
    if (!dragging) return

    const containerWidth = containerRef.current.offsetWidth
    let newLeft =
      e.clientX - containerRef.current.getBoundingClientRect().left - startX

    if (newLeft < 0) newLeft = 0
    if (newLeft > containerWidth - sliderRef.current.offsetWidth) {
      newLeft = containerWidth - sliderRef.current.offsetWidth
      setIsUnlocked(true)
      setIsEndReached(true)
      setDragging(false)
    } else {
      setIsEndReached(false)
    }

    setOffsetX(newLeft)
    sliderRef.current.style.left = `${newLeft}px`
  }

  const handleTouchStart = (e) => {
    setDragging(true)
    setStartX(
      e.touches[0].clientX - sliderRef.current.getBoundingClientRect().left
    )
  }

  const handleTouchMove = (e) => {
    if (!dragging) return

    const containerWidth = containerRef.current.offsetWidth
    let newLeft =
      e.touches[0].clientX -
      containerRef.current.getBoundingClientRect().left -
      startX

    if (newLeft < 0) newLeft = 0
    if (newLeft > containerWidth - sliderRef.current.offsetWidth) {
      newLeft = containerWidth - sliderRef.current.offsetWidth
      setIsUnlocked(true)
      setIsEndReached(true)
      setDragging(false)
    } else {
      setIsEndReached(false)
    }

    setOffsetX(newLeft)
    sliderRef.current.style.left = `${newLeft}px`
  }

  const handleMouseUp = () => {
    setDragging(false)
    if (!isUnlocked) {
      setOffsetX(0)
      sliderRef.current.style.left = '0'
    }
  }

  const handleTouchEnd = () => {
    setDragging(false)
    if (!isUnlocked) {
      setOffsetX(0)
      sliderRef.current.style.left = '0'
    }
  }

  const closeModal = () => {
    setIsUnlocked(false)
    setIsEndReached(false)
    setOffsetX(0)
    sliderRef.current.style.left = '0'
  }

  // Obtener la fecha actual
  const today = new Date()

  // Calcular la fecha 15 días en el futuro
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 30)

  return (
    <div className={styles.container}>
      <div
        className={`${styles.slideContainer} ${
          isEndReached ? styles.endReached : ''
        }`}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <p>Desliza para pedir una cita.</p>

        <Image
          src={Forward}
          height={35}
          width={35}
          className={`${styles.slider} ${!dragging ? styles.animated : ''}`}
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ left: offsetX }}
          alt='Flecha deslizar'
        />
      </div>
      {isUnlocked && (
        <div className={`${styles.modal} ${styles.show}`}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => closeModal()}>
              &times;
            </span>
            <Calendar minDate={today} maxDate={maxDate} />
          </div>
        </div>
      )}
    </div>
  )
}

export default SlideToUnlock
