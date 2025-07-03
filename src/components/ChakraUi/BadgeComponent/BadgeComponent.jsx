import { Badge } from '@chakra-ui/react'

const availableColors = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
]

const getRandomColor = () => {
  const index = Math.floor(Math.random() * availableColors.length)
  return availableColors[index]
}

const BadgeComponent = ({
  children,
  colorPalette = 'green',
  icon,
  randomColor = false,
}) => {
  const finalColor = randomColor ? getRandomColor() : colorPalette

  return (
    <Badge
      colorPalette={finalColor}
      variant='surface'
      size='sm'
      css={{
        _icon: {
          width: '3',
          height: '3',
        },
      }}
    >
      {children}
      {icon && icon}
    </Badge>
  )
}

export default BadgeComponent
