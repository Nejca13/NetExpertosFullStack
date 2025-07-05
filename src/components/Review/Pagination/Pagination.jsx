import IoIosArrowDropleft from '@/assets/icon/IoIosArrowDropleft'
import styles from './Pagination.module.css'
import IoIosArrowDropright from '@/assets/icon/IoIosArrowDropright'
import ArrowLeftIcon from '@/assets/icon/ArrowLeftIcon'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 1)
    let end = Math.min(totalPages, start + 2)
    if (end - start < 2) {
      start = Math.max(1, end - 2)
    }
    const pages = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={styles.paginate_container}>
      <button
        disabled={currentPage === 1}
        style={
          currentPage === 1
            ? { background: '#8dc8ff' }
            : { background: '#319bff' }
        }
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ArrowLeftIcon color='white' size={'18px'} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={styles.numbers}
          style={{
            background: currentPage === page ? '#319bff' : '#8dc8ff',
          }}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        style={
          currentPage === totalPages
            ? { background: '#8dc8ff' }
            : { background: '#319bff' }
        }
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ArrowLeftIcon reverse={true} color='white' size={'18px'} />
      </button>
    </div>
  )
}

export default Pagination
