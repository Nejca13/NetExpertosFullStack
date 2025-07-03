'use client'

import { Portal, Select, createListCollection } from '@chakra-ui/react'

const items = [
  { label: '25', value: '25' },
  { label: '50', value: '50' },
  { label: '75', value: '75' },
  { label: '100', value: '100' },
]

const itemsCollection = createListCollection({ items })

const NumberPage = ({ updateFilters, limit }) => {
  return (
    <Select.Root
      collection={itemsCollection}
      value={[String(limit)]} // 👈 importante: Chakra espera un array de strings
      closeOnSelect
      onValueChange={(e) => {
        updateFilters({ limit: Number(e.value), page: 1 }) // 👈 resetea a la página 1
      }}
      size='sm'
      maxW='70px'
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content>
            {itemsCollection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}

export default NumberPage
