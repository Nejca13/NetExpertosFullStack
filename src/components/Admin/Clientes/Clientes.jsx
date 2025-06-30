'use client'

import AvatarComponent from '@/components/ChakraUi/AvatarComponent/AvatarComponent'
import TableComponent from '@/components/ChakraUi/TableComponent/TableComponent'
import { useClientesDashboard } from '@/hooks/useClientDashboard'
import { Stack } from '@chakra-ui/react'

const Clientes = () => {
  const { data, loading, error } = useClientesDashboard()
  console.log(data)

  const filteredData = data?.map((user) => ({
    Clientes: (
      <AvatarComponent
        name={user.nombre + ' ' + user.apellido}
        correo={user.correo}
        img={user.foto_perfil}
      />
    ),
    Rol: user.rol,
    Estado: user.estado,
    'Fecha de registro': user.fecha_registro,
  }))

  return (
    <Stack>
      <TableComponent rows={filteredData} />
    </Stack>
  )
}

export default Clientes
