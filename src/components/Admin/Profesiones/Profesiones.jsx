'use client'

import BadgeComponent from '@/components/ChakraUi/BadgeComponent/BadgeComponent'
import TableComponent from '@/components/ChakraUi/TableComponent/TableComponent'
import { Tooltip } from '@/components/ChakraUi/tooltip'
import useFetch from '@/hooks/useFetch'
import { Stack } from '@chakra-ui/react'

const Profesiones = () => {
  const { data, loading, error } = useFetch('/api/profesiones')

  const filteredData = data?.map((profesion) => ({
    Nombre: (
      <BadgeComponent randomColor={true}>{profesion.nombre}</BadgeComponent>
    ),
    Descripción: (
      <Tooltip content={profesion.descripcion} openDelay={500} closeDelay={100}>
        <span>{profesion.descripcion?.slice(0, 130)}...</span>
      </Tooltip>
    ),
  }))

  return (
    <Stack width='100%'>
      <TableComponent rows={filteredData} />
    </Stack>
  )
}

export default Profesiones
