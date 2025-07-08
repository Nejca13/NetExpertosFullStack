'use client'
import { useState } from 'react'
import styles from './ModalCreateReview.module.css'
import useStore from '@/store/store'

const ModalCreateReview = ({ _id }) => {
  const { currentUser } = useStore()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState(null)

  const handleClick = (value) => {
    setRating(value)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una puntuación.')
      return
    }

    if (comentario.trim() === '') {
      setError('Por favor escribe un comentario.')
      return
    }

    setError(null)

    const id_cliente = currentUser?.user_data?._id

    const reviewData = {
      id_profesional: _id,
      id_cliente,
      puntuacion: rating,
      comentario: comentario.trim(),
    }

    try {
      const res = await fetch(`/api/reviews/?client_id=${id_cliente}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (!res.ok) {
        throw new Error('Error al enviar la reseña')
      }

      console.log('Reseña enviada con éxito')
      setRating(0)
      setComentario('')
    } catch (err) {
      console.error(err)
      setError('Hubo un problema al enviar la reseña. Intenta nuevamente.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Escribe una reseña</h2>

        <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleClick(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                fontSize: '40px',
                color: star <= (hover || rating) ? '#FFD700' : '#ccc',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          name='review'
          id='review'
          placeholder='Escribe tu reseña aquí'
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        <button onClick={handleSubmit}>Enviar reseña</button>
        {error && <small style={{ color: 'red' }}>{error}</small>}
      </div>
    </div>
  )
}

export default ModalCreateReview
