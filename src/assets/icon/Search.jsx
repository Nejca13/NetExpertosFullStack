const Search = ({
  width = '24',
  height = '24',
  color = 'white',
  className = '',
  stroke = '2.5',
}) => (
  <svg
    stroke={color}
    fill='none'
    strokeWidth={stroke}
    viewBox='0 0 24 24'
    strokeLinecap='round'
    strokeLinejoin='round'
    height={height}
    width={width}
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <circle cx='11' cy='11' r='8'></circle>
    <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
  </svg>
)

export default Search
