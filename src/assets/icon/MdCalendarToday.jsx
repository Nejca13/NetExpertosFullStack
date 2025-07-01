const MdCalendarToday = ({
  width = '24',
  height = '24',
  color = 'white',
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
    <path d='M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z'></path>
  </svg>
)

export default MdCalendarToday
