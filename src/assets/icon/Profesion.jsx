const Profesion = ({
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
    <path d='M12 12h.01'></path>
    <path d='M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'></path>
    <path d='M22 13a18.15 18.15 0 0 1-20 0'></path>
    <rect width='20' height='14' x='2' y='6' rx='2'></rect>
  </svg>
)

export default Profesion
