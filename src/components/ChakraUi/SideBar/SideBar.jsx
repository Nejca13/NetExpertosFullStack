'use client'
import Cliente from '@/assets/icon/Cliente'
import Menu from '@/assets/icon/Menu'
import Profesional from '@/assets/icon/Profesional'
import Cita from '@/assets/icon/Cita'
import Denuncia from '@/assets/icon/Denuncia'
import { Button, CloseButton, Drawer, Portal } from '@chakra-ui/react'
import { useState } from 'react'
import Profesiones from '@/assets/icon/Profesiones'
import { ColorModeButton } from '../color-mode'
import { useRouter } from 'next/navigation'
import useStore from '@/store/store'

const SideBar = ({ setTypeSection }) => {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { icon: <Cliente />, label: 'Clientes', value: 'clientes' },
    { icon: <Profesional />, label: 'Profesionales', value: 'profesionales' },
    { icon: <Profesiones />, label: 'Profesiones', value: 'profesiones' },
    { icon: <Cita />, label: 'Citas', value: 'citas' },
    { icon: <Denuncia />, label: 'Denuncias', value: 'denuncias' },
  ]

  const router = useRouter()

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement='start'
    >
      <Drawer.Trigger asChild>
        <Button variant='subtle' size='sm' w='min-content'>
          <Menu />
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>NetExpertos</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body display='flex' flexDirection='column' gap={6}>
              {menuItems.map(({ icon, label, value }) => (
                <Button
                  key={label}
                  variant='ghost'
                  justifyContent='flex-start'
                  gap={4}
                  size='sm'
                  onClick={() => {
                    setTypeSection(value)
                    setOpen(false)
                  }}
                >
                  {icon}
                  {label}
                </Button>
              ))}
            </Drawer.Body>
            <Drawer.Footer>
              <Button
                variant='subtle'
                w='100%'
                onClick={() => router.push('/')}
              >
                Volver al inicio
              </Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size='sm' />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}

export default SideBar
