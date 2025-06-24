const Cita = ({
  width = '24',
  height = '24',
  color = 'currentColor',
  className = '',
}) => (
  <svg
    stroke={color}
    fill='none'
    strokeWidth='2'
    viewBox='0 0 24 24'
    strokeLinecap='round'
    strokeLinejoin='round'
    height={height}
    width={width}
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path d='M8 2v4'></path>
    <path d='M16 2v4'></path>
    <rect width='18' height='18' x='3' y='4' rx='2'></rect>
    <path d='M3 10h18'></path>
  </svg>
)

export default Cita
