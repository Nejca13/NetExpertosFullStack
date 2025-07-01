'use client'

import Citas from '@/components/Admin/Citas/Citas'
import Clientes from '@/components/Admin/Clientes/Clientes'
import Denuncias from '@/components/Admin/Denuncias/Denuncias'
import Profesionales from '@/components/Admin/Profesionales/Profesionales'
import Profesiones from '@/components/Admin/Profesiones/Profesiones'
import useStore from '@/store/store'
import SideBar from '@/components/ChakraUi/SideBar/SideBar'
import { ColorModeButton } from '@/components/ChakraUi/color-mode'
import { Box, Flex, HStack, Stack, Tabs, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import TabsComponent from '@/components/ChakraUi/TabsComponent/TabsComponent'
import Cliente from '@/assets/icon/Cliente'
import Profesional from '@/assets/icon/Profesional'
import Cita from '@/assets/icon/Cita'
import Denuncia from '@/assets/icon/Denuncia'
import Profesion from '@/assets/icon/Profesion'

const items = [
  {
    key: 'clientes',
    label: 'Clientes',
    icon: <Cliente />,
    component: <Clientes />,
  },
  {
    key: 'profesionales',
    label: 'Profesionales',
    icon: <Profesional />,
    component: <Profesionales />,
  },
  {
    key: 'profesiones',
    label: 'Profesiones',
    icon: <Profesion />,
    component: <Profesiones />,
  },
  {
    key: 'citas',
    label: 'Citas',
    icon: <Cita />,
    component: <Citas />,
  },
  {
    key: 'denuncias',
    label: 'Denuncias',
    icon: <Denuncia />,
    component: <Denuncias />,
  },
]

const DashboardPage = () => {
  const { currentUser, typeSection, setTypeSection, hasHydrated } = useStore()

  useEffect(() => {
    if (hasHydrated) {
      console.log(true)
    }
  }, [hasHydrated])

  if (!hasHydrated) return null

  return (
    <Stack padding='15px 20px 20px 20px' minH='100vh'>
      <HStack justify='space-between' align='center' fontWeight='600'>
        NetExpertos Dashboard
        <Flex>
          <ColorModeButton />
          <SideBar
            currentUser={currentUser?.user_data}
            items={items}
            setTypeSection={setTypeSection}
          />
        </Flex>
      </HStack>

      <TabsComponent
        value={typeSection}
        onValueChange={setTypeSection}
        tabs={items}
      />
    </Stack>
  )
}

export default DashboardPage
