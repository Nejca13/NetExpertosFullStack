'use client'
import { useReviewsProfesional } from '@/hooks/useReviewProfesional'
import { useParams, useRouter } from 'next/navigation'
import styles from './page.module.css'
import Calificacion from '@/components/Calificacion/Calificacion'
import Image from 'next/image'
import ArrowLeftIcon from '@/assets/icon/ArrowLeftIcon'
import { formatDateShort } from '@/utils/formatDateOnly'
import ChatIcon from '@/assets/icon/ChatIcon'
import Modal from '@/components/Modal/Modal'
import { useState } from 'react'
import ClienteCard from '@/components/Review/ClienteCard/ClienteCard'
import ProfesionalCard from '@/components/Review/ProfesionalCard/ProfesionalCard'
import Pagination from '@/components/Review/Pagination/Pagination'

const ReviewProfesional = () => {
  const [selectedReview, setSelectedReview] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const params = useParams()
  const router = useRouter()
  const profesionalId = params?.id

  if (!profesionalId) {
    return <div>Cargando ID del profesional...</div>
  }

  //Hook de reviews
  const { data, loading, error, filters, updateFilters } =
    useReviewsProfesional(profesionalId)

  //Porcentaje del usuario en la imagen
  const getBorderStyle = (rating) => {
    const percent = (rating / 5) * 100
    return {
      background: `conic-gradient(from 0deg, #FFD700 ${percent}%, #eee ${percent}%)`,
      borderRadius: '50%',
      padding: '5px',
      display: 'inline-block',
    }
  }

  //Paginado
  const totalPages = Math.ceil(data?.total_items || 0 / filters.limit)

  const handlePageChange = (page) => {
    updateFilters({ page })
  }

  //Modal
  const handleModal = (selectedReview) => {
    setSelectedReview(selectedReview)
    setOpenModal(true)
  }

  const closeModal = () => {
    setSelectedReview(null)
    setOpenModal(false)
  }

  if (loading) return <div>Cargando reseñas...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className={styles.container}>
      <div className={styles.back_button_title}>
        <button onClick={() => router.back()}>
          <ArrowLeftIcon />
        </button>
        <span>Puntuación</span>
      </div>
      <div className={styles.header}>
        <div className={styles.rating}>
          <Image
            style={getBorderStyle(data?.promedio)}
            src={data?.resenas[0]?.foto_profesional}
            width={90}
            height={90}
            alt='foto_profesional'
          />
          <strong>
            {data?.promedio?.toFixed(1)}
            <Calificacion rating={data?.promedio} size='24px' />
          </strong>
          <span className={styles.reseñas}>
            Cantidad de reseñas ({data?.resenas.length})
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.button_control}>
          <span>Todas las reseñas</span>
          <select name='sort' id='sort'>
            <option value='asc'>Ordenar por fecha</option>
            <option value='desc'>Ordenar por rating</option>
          </select>
        </div>

        <div className={styles.reviews}>
          {data?.resenas.map((resena, index) => (
            <div key={index} className={styles.resena}>
              <div className={styles.info_cliente}>
                <div className={styles.cliente}>
                  <Image
                    src={resena?.foto_cliente}
                    width={40}
                    height={40}
                    alt='foto_cliente'
                  />
                  <div className={styles.reating_cliente}>
                    <span>{resena?.nombre_cliente}</span>
                    <small>
                      <Calificacion rating={resena?.puntuacion} size='16px' />
                      {resena?.puntuacion}
                    </small>
                  </div>
                </div>
                <small className={styles.date}>
                  {formatDateShort(resena?.fecha_creacion)}
                </small>
              </div>
              <p className={styles.coment}>{resena?.comentario}</p>
              <div className={styles.response}>
                <button
                  disabled={resena?.respuesta_profesional ? false : true}
                  onClick={() => handleModal(resena)}
                >
                  <ChatIcon color='#494949' width='16px' height='16px' />
                  {resena?.respuesta_profesional
                    ? '1 Respuesta'
                    : '0 Respuestas'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Paginado */}
        {data.total_pages > 1 && (
          <Pagination
            currentPage={data.page}
            totalPages={data.total_pages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <Modal isModalOpen={openModal} onClose={closeModal}>
        <div className={styles.content_modal}>
          <div className={styles.content}>
            <h2>Respuestas</h2>
            <ClienteCard resena={selectedReview} />
            <ProfesionalCard response={selectedReview} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ReviewProfesional
