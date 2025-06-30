import FaRegStar from '@/assets/icon/FaRegStar'
import FaStar from '@/assets/icon/FaStar'

export default function Calificacion({ rating = 0, total = 5 }) {
  const rounded = Math.floor(rating)
  const stars = []

  for (let i = 1; i <= total; i++) {
    stars.push(
      i <= rounded ? (
        <FaStar key={i} color='#ffc107' width='16px' height='16px' />
      ) : (
        <FaRegStar key={i} color='#ccc' width='16px' height='16px' />
      )
    )
  }

  return <div style={{ display: 'flex', gap: '4px' }}>{stars}</div>
}
