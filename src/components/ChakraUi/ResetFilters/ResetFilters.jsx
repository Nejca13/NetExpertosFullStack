import { Button } from '@chakra-ui/react'
import { MdRestartAlt } from 'react-icons/md'

const ResetFilters = ({ resetFilters }) => {
  return (
    <Button
      variant='subtle'
      size='sm'
      colorScheme='gray'
      onClick={resetFilters}
    >
      <MdRestartAlt />
      Limpiar filtros
    </Button>
  )
}

export default ResetFilters
