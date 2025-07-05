const ArrowLeftIcon = ({
  size = 24,
  color = 'currentColor',
  className = '',
  reverse = false,
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`lucide lucide-arrow-left ${className}`}
      style={{ transform: reverse ? 'scaleX(-1)' : 'none' }}
    >
      <path d='m12 19-7-7 7-7'></path>
      <path d='M19 12H5'></path>
    </svg>
  )
}

export default ArrowLeftIcon
