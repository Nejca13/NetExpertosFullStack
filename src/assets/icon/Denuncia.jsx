const Denuncia = ({
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
    <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'></path>
    <line x1='12' y1='9' x2='12' y2='13'></line>
    <line x1='12' y1='17' x2='12.01' y2='17'></line>
  </svg>
)

export default Denuncia
