const ClockIcon = ({ size = 24, color = 'currentColor', className = '' }) => {
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
      className={`lucide lucide-clock ${className}`}
    >
      <circle cx='12' cy='12' r='10'></circle>
      <polyline points='12 6 12 12 16 14'></polyline>
    </svg>
  )
}

export default ClockIcon
