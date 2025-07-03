'use client'

import AvatarComponent from '@/components/ChakraUi/AvatarComponent/AvatarComponent'
import TableComponent from '@/components/ChakraUi/TableComponent/TableComponent'
import { useClientesDashboard } from '@/hooks/useClientDashboard'
import { Flex, Stack } from '@chakra-ui/react'
import Filters from './Filters/Filters'
import { formatDateAR } from '@/utils/formatDateAr'
import PaginationComponent from '@/components/ChakraUi/PaginationComponent/PaginationComponent'
import Link from 'next/link'
import Url from '@/assets/icon/Url'
import BadgeComponent from '@/components/ChakraUi/BadgeComponent/BadgeComponent'
import NumberPage from '@/components/ChakraUi/NumberPage/NumberPage'

const Clientes = () => {
  const { data, loading, error, filters, updateFilters, resetFilters } =
    useClientesDashboard()

  // Filtramos datos para la tabla
  const filteredData = data?.clientes?.map((user) => ({
    Clientes: (
      <AvatarComponent
        name={user.nombre + ' ' + user.apellido}
        correo={user.correo}
        img={user.foto_perfil}
      />
    ),
    Rol: <BadgeComponent>{user.rol}</BadgeComponent>,
    Ubicación: (
      <BadgeComponent colorPalette='purple' icon={<Url />}>
        <Link
          href={`https://www.google.com/maps?q=${user?.ubicacion}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          Ubicación
        </Link>
      </BadgeComponent>
    ),
    Estado: user.estado || 'Sin estado',
    'Fecha de registro': formatDateAR(user.fecha_registro),
  }))

  return (
    <Stack w={'100%'} display='flex' flexDir='column' gap='15px'>
      <Filters
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
      />
      <TableComponent rows={filteredData} loading={loading} />
      <Flex
        width='100%'
        flexDir='row'
        alignItems='center'
        justifyContent='space-between'
      >
        <NumberPage updateFilters={updateFilters} limit={filters.limit} />
        <PaginationComponent
          total={data?.total}
          page={filters?.page}
          limit={filters?.limit}
          updateFilters={updateFilters}
        />
      </Flex>
    </Stack>
  )
}

export default Clientes
