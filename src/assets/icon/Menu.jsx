const Menu = ({
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
    <path d='M3 12h18'></path>
    <path d='M3 18h18'></path>
    <path d='M3 6h18'></path>
  </svg>
)

export default Menu
