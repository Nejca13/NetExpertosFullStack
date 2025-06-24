'use client'

import Table from '@/components/ChakraUi/Table/Table'
import useFetch from '@/hooks/useFetch'
import { Stack } from '@chakra-ui/react'

const Profesiones = () => {
  const { data, loading, error } = useFetch('/api/profesiones')
  const filteredData = data?.map((profesion) => ({
    Nombre: profesion.nombre,
    Descripción: profesion.descripcion,
  }))

  return (
    <Stack>
      <Table rows={filteredData} />
    </Stack>
  )
}

export default Profesiones
