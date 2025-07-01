'use client'
import MdCalendarToday from '@/assets/icon/MdCalendarToday'
import { Button, Field, Input, Menu, Portal, Stack } from '@chakra-ui/react'
import { useState } from 'react'

const DateComponent = ({ updateFilters }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    setLoading(true)
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.target))

    updateFilters({ form_date: formData.from_date })
    updateFilters({ to_date: formData.to_date })
    setLoading(false)
  }

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          variant='outline'
          size='sm'
          css={{
            _icon: {
              width: '3',
              height: '3',
            },
          }}
        >
          <MdCalendarToday />
          Fecha de registro
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <form onSubmit={handleSubmit}>
              <Stack gap='2' align='flex-start' w='200px' p='6px'>
                <Field.Root>
                  <Field.Label fontSize='13px'>Fecha desde</Field.Label>
                  <Input
                    type='date'
                    size='sm'
                    name='from_date'
                    id='from_date'
                    required
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label fontSize='13px'>Fecha hasta</Field.Label>
                  <Input
                    type='date'
                    size='sm'
                    name='to_date'
                    id='to_date'
                    required
                  />
                </Field.Root>

                <Button w='100%' size='sm' type='submit' loading={loading}>
                  Buscar
                </Button>
              </Stack>
            </form>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default DateComponent
