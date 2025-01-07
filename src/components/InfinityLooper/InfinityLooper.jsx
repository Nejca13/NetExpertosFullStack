import React, { useState, useEffect, useRef, useCallback } from 'react'
import './InfinityLooper.css' // Estilos CSS del componente

function InfiniteLooper({ speed, direction, children }) {
  const [looperInstances, setLooperInstances] = useState(1)
  const outerRef = useRef(null)
  const innerRef = useRef(null)

  const setupInstances = useCallback(() => {
    if (!innerRef.current || !outerRef.current) return

    const { width } = innerRef.current.getBoundingClientRect()
    const { width: parentWidth } = outerRef.current.getBoundingClientRect()
    const instanceWidth = width / innerRef.current.children.length

    if (width < parentWidth + instanceWidth) {
      setLooperInstances(Math.ceil(parentWidth / width) + 1)
    }
  }, [])

  useEffect(() => {
    setupInstances()
    const resizeListener = () => setupInstances()
    window.addEventListener('resize', resizeListener)
    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [setupInstances])

  const resetAnimation = () => {
    if (innerRef.current) {
      innerRef.current.setAttribute('data-animate', 'false')
      setTimeout(() => {
        if (innerRef.current) {
          innerRef.current.setAttribute('data-animate', 'true')
        }
      }, 50)
    }
  }

  return (
    <div className='looper' ref={outerRef}>
      <div className='looper__innerList' ref={innerRef} data-animate='true'>
        {[...Array(looperInstances)].map((_, ind) => (
          <div
            key={ind}
            className='looper__listInstance'
            style={{
              animationDuration: `${speed}s`,
              animationDirection: direction === 'right' ? 'reverse' : 'normal',
            }}
            onAnimationIteration={resetAnimation}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}

export default InfiniteLooper
