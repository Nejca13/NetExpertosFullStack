'use client'

import Table from '@/components/ChakraUi/Table/Table'
import { Tooltip } from '@/components/ChakraUi/tooltip'
import useFetch from '@/hooks/useFetch'
import { Stack } from '@chakra-ui/react'

const Denuncias = () => {
  const { data, loading, error } = useFetch('/api/denuncias')

  console.log(data)
  // const filteredData = data?.map((denuncia) => ({}))

  return <Stack>{/* <Table rows={filteredData} /> */}</Stack>
}

export default Denuncias
