import MdRestartAlt from '@/assets/icon/MdRestartAlt'
import { Button } from '@chakra-ui/react'

const ResetFilters = ({ resetFilters }) => {
  return (
    <Button
      variant='subtle'
      size='sm'
      colorScheme='gray'
      onClick={resetFilters}
      css={{
        _icon: {
          width: '5',
          height: '5',
        },
      }}
    >
      <MdRestartAlt />
      Limpiar filtros
    </Button>
  )
}

export default ResetFilters
