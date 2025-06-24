'use client'

import AvatarComponent from '@/components/ChakraUi/AvatarComponent/AvatarComponent'
import Table from '@/components/ChakraUi/Table/Table'
import useFetch from '@/hooks/useFetch'
import { Stack } from '@chakra-ui/react'

const Clientes = () => {
  const { data, loading, error } = useFetch('/api/clientes')

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
      <Table rows={filteredData} />
    </Stack>
  )
}

export default Clientes
