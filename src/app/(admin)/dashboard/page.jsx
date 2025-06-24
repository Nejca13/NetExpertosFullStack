'use client'

import Citas from '@/components/Admin/Citas/Citas'
import Clientes from '@/components/Admin/Clientes/Clientes'
import Denuncias from '@/components/Admin/Denuncias/Denuncias'
import Profesionales from '@/components/Admin/Profesionales/Profesionales'
import Profesiones from '@/components/Admin/Profesiones/Profesiones'
import useStore from '@/store/store'
import SideBar from '@/components/ChakraUi/SideBar/SideBar'
import { ColorModeButton } from '@/components/ChakraUi/color-mode'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'

const DashboardPage = () => {
  const { typeSection, setTypeSection, hasHydrated } = useStore()

  const componentsMap = {
    clientes: Clientes,
    profesionales: Profesionales,
    profesiones: Profesiones,
    citas: Citas,
    denuncias: Denuncias,
  }

  const Component = componentsMap[typeSection] || null

  useEffect(() => {
    if (hasHydrated) {
      console.log(true)
    }
  }, [hasHydrated])

  if (!hasHydrated) {
    return null
  }

  return (
    <Stack minH='100vh' padding='15px 20px 20px 20px'>
      <HStack justify='space-between' align='center' mb='20px'>
        <Text
          textTransform='capitalize'
          fontSize='2xl'
          fontWeight='500'
          mr='auto'
        >
          {typeSection}
        </Text>
        <ColorModeButton />
        <SideBar setTypeSection={setTypeSection} />
      </HStack>

      <Box>{Component && <Component type={typeSection} />}</Box>
    </Stack>
  )
}

export default DashboardPage
