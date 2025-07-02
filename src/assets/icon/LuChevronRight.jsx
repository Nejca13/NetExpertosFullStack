const LuChevronRight = ({
  width = '24',
  height = '24',
  color = 'white',
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
    <path d='m9 18 6-6-6-6'></path>
  </svg>
)

export default LuChevronRight
