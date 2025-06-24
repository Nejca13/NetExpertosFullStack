import { Avatar, HStack, Stack, Text } from '@chakra-ui/react'

const AvatarComponent = ({ name, img, correo }) => {
  return (
    <Stack gap='8'>
      <HStack key={correo} gap='4'>
        <Avatar.Root>
          <Avatar.Fallback name={name} />
          <Avatar.Image src={img} />
        </Avatar.Root>
        <Stack gap='0'>
          <Text fontWeight='medium'>{name}</Text>
          <Text color='fg.muted' textStyle='sm'>
            {correo}
          </Text>
        </Stack>
      </HStack>
    </Stack>
  )
}

export default AvatarComponent
