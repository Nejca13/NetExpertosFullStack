import { RatingGroup, Text } from '@chakra-ui/react'

const RatingComponent = ({ count }) => {
  return (
    <RatingGroup.Root
      allowHalf
      readOnly
      count={5}
      defaultValue={count}
      colorPalette='yellow'
      size='sm'
      display='flex'
      gap='3px'
    >
      <Text as={'span'} fontSize='xs'>
        ({count.toFixed(1)})
      </Text>
      <RatingGroup.HiddenInput />
      <RatingGroup.Control />
    </RatingGroup.Root>
  )
}
export default RatingComponent
