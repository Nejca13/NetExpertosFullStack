'use client'

import AvatarComponent from '@/components/ChakraUi/AvatarComponent/AvatarComponent'
import TableComponent from '@/components/ChakraUi/TableComponent/TableComponent'
import { useClientesDashboard } from '@/hooks/useClientDashboard'
import { Stack } from '@chakra-ui/react'
import Filters from './Filters/Filters'
import { formatDateAR } from '@/utils/formatDateAr'
import PaginationComponent from '@/components/ChakraUi/PaginationComponent/PaginationComponent'

const Clientes = () => {
  const { data, loading, error, filters, updateFilters, resetFilters } =
    useClientesDashboard()

  const filteredData = data?.clientes?.map((user) => ({
    Clientes: (
      <AvatarComponent
        name={user.nombre + ' ' + user.apellido}
        correo={user.correo}
        img={user.foto_perfil}
      />
    ),
    Rol: user.rol,
    Estado: user.estado,
    'Fecha de registro': formatDateAR(user.fecha_registro),
  }))

  return (
    <Stack w={'100%'} display='flex' flexDir='column'>
      {/* Filtros */}
      <Filters
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
      />

      {/* Tabla */}
      <TableComponent rows={filteredData} loading={loading} />

      {/* Paginacion */}
      <PaginationComponent />
    </Stack>
  )
}

export default Clientes
