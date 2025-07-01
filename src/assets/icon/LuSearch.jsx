const LuSearch = ({
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
    <circle cx='11' cy='11' r='8'></circle>
    <path d='m21 21-4.3-4.3'></path>
  </svg>
)

export default LuSearch
