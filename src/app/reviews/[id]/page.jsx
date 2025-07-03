'use client'
import { useReviewsProfesional } from '@/hooks/useReviewProfesional'
import { useParams } from 'next/navigation'
import styles from './page.module.css'
import ArrowBackIcon from '@/assets/images/ArrowBack'
import Calificacion from '@/components/Calificacion/Calificacion'

const ReviewProfesional = () => {
  const params = useParams()
  const profesionalId = params?.id

  if (!profesionalId) {
    return <div>Cargando ID del profesional...</div>
  }

  const { data, loading, error } = useReviewsProfesional(profesionalId)

  if (loading) return <div>Cargando reseñas...</div>
  if (error) return <div>Error: {error}</div>

  console.log('Reseñas:', data)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* boton y titulo  */}
        <div className={styles.back_button_title}>
          <button>
            <ArrowBackIcon />
          </button>
          <span>Reseñeas del Profesional</span>
        </div>
        {/* rating del profesional seleccionado */}
        <div className={styles.rating}>
          <div className={styles.stars}>
            <strong>4.4</strong>
            <Calificacion rating={4.4} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewProfesional
