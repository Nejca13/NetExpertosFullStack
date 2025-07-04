const IconInfo = ({
  width = '24',
  height = '24',
  color = 'var(--color-gris-medio)',
  className = '',
}) => (
  <svg
    stroke={color}
    fill={color}
    strokeWidth='0'
    viewBox='0 0 24 24'
    height={height}
    width={width}
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path fill='none' d='M0 0h24v24H0z'></path>
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'></path>
  </svg>
)

export default IconInfo
