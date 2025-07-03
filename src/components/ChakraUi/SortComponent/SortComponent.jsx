'use client'

import HiSortAscending from '@/assets/icon/HiSortAscending'
import { Button, Menu, Portal } from '@chakra-ui/react'

export const SortComponent = ({ filters, updateFilters }) => {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant='outline' size='sm'>
          <HiSortAscending />
          Ordenar
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW='10rem'>
            <Menu.RadioItemGroup
              value={filters?.sort_type || 'desc'}
              onValueChange={(item) => updateFilters({ sort_type: item.value })}
            >
              {items.map((item) => (
                <Menu.RadioItem key={item.value} value={item.value}>
                  {item.label}
                  <Menu.ItemIndicator />
                </Menu.RadioItem>
              ))}
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export default SortComponent

const items = [
  { label: 'Ascendente', value: 'asc' },
  { label: 'Descendente', value: 'desc' },
]
