'use client'

import Table from '@/components/ChakraUi/Table/Table'
import useFetch from '@/hooks/useFetch'
import { Stack } from '@chakra-ui/react'

const Profesionales = () => {
  const { data, loading, error } = useFetch('/api/profesionales')

  console.log(data)

  // const filteredData = data?.map((user) => ({
  //   Usuario: (
  //     <AvatarComponent
  //       name={user.nombre + ' ' + user.apellido}
  //       correo={user.correo}
  //       img={user.foto_perfil}
  //     />
  //   ),
  //   Rol: user.rol,
  //   Estado: user.estado,
  //   'Fecha de registro': user.fecha_registro,
  // }))

  return <Stack>{/* <Table rows={filteredData} /> */}</Stack>
}

export default Profesionales
