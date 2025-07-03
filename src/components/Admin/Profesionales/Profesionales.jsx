'use client'

import AvatarComponent from '@/components/ChakraUi/AvatarComponent/AvatarComponent'
import { Flex, Stack } from '@chakra-ui/react'
import { formatDateAR } from '@/utils/formatDateAr'
import { useProfesionalesDashboard } from '@/hooks/useProfresionalDashboard'
import TableComponent from '@/components/ChakraUi/TableComponent/TableComponent'
import RatingComponent from '@/components/ChakraUi/RatingComponent/RatingComponent'
import { Tooltip } from '@/components/ChakraUi/tooltip'
import PaginationComponent from '@/components/ChakraUi/PaginationComponent/PaginationComponent'
import Filters from './Filters/Filters'
import BadgeComponent from '@/components/ChakraUi/BadgeComponent/BadgeComponent'
import NumberPage from '@/components/ChakraUi/NumberPage/NumberPage'

const Profesionales = () => {
  const { data, loading, error, filters, updateFilters, resetFilters } =
    useProfesionalesDashboard()

  // Filtramos datos para la tabla
  const filteredData = data?.profesionales?.map((user) => ({
    Profesional: (
      <AvatarComponent
        name={`${user.nombre} ${user.apellido}`}
        correo={user.correo}
        img={user.foto_perfil}
      />
    ),
    Rubro: (
      <BadgeComponent colorPalette='pink'>{user.rubro_nombre}</BadgeComponent>
    ),
    Profesión: (
      <BadgeComponent colorPalette='teal'>
        {user.profesion_nombre}
      </BadgeComponent>
    ),
    'Acerca del profesional': (
      <Tooltip content={user.acerca_de_mi} openDelay={500} closeDelay={100}>
        <span>{user.acerca_de_mi.slice(0, 20)}...</span>
      </Tooltip>
    ),
    Calificación: <RatingComponent count={user?.calificacion} />,
    Telefono: '+' + user.numero,
    'Fecha de registro': formatDateAR(user.fecha_registro),
  }))

  return (
    <Stack w={'100%'} display='flex' flexDir='column'>
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

export default Profesionales
