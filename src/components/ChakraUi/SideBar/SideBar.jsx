'use client'
import Cliente from '@/assets/icon/Cliente'
import Menu from '@/assets/icon/Menu'
import Profesional from '@/assets/icon/Profesional'
import Cita from '@/assets/icon/Cita'
import Denuncia from '@/assets/icon/Denuncia'
import { Button, CloseButton, Drawer, Portal } from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Profesion from '@/assets/icon/Profesion'
import AvatarComponent from '../AvatarComponent/AvatarComponent'

const SideBar = ({ currentUser, items, setTypeSection }) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { nombre, apellido, correo, foto_perfil } = currentUser
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
            <Drawer.Header mt='10px'>
              <AvatarComponent
                name={nombre + ' ' + apellido}
                correo={correo}
                img={foto_perfil}
                size='xl'
              />
            </Drawer.Header>
            <Drawer.Body display='flex' flexDirection='column' gap={5}>
              {items.map(({ icon, label, key }) => (
                <Button
                  key={label}
                  variant='ghost'
                  justifyContent='flex-start'
                  gap={4}
                  size='md'
                  onClick={() => {
                    setTypeSection(key)
                    setOpen(false)
                  }}
                  css={{
                    _icon: {
                      width: '4',
                      height: '4',
                    },
                  }}
                >
                  {icon}
                  {label}
                </Button>
              ))}
            </Drawer.Body>
            <Drawer.Footer>
              <Button w='100%' onClick={() => router.push('/')}>
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
