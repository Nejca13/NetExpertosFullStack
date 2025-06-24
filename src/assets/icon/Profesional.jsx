const Profesional = ({
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
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'></path>
    <circle cx='9' cy='7' r='4'></circle>
    <polyline points='16 11 18 13 22 9'></polyline>
  </svg>
)

export default Profesional
