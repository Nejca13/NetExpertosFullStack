import { Tabs, HStack, Icon, Text, Flex } from '@chakra-ui/react'

const TabsComponent = ({ tabs, value, onValueChange }) => {
  return (
    <Tabs.Root
      variant='line'
      value={value}
      onValueChange={(e) => onValueChange(e.value)}
      flexGrow='1'
      display='flex'
      flexDir='column'
    >
      <Tabs.List display={{ base: 'none', md: 'flex' }}>
        {tabs.map(({ key, label, icon }) => (
          <Tabs.Trigger
            key={key}
            value={key}
            css={{
              _icon: {
                width: '4',
                height: '4',
              },
            }}
          >
            <HStack spacing={2}>
              {icon}
              <Text>{label}</Text>
            </HStack>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {tabs.map(({ key, component }) => (
        <Tabs.Content key={key} value={key} display='flex' flexGrow='1'>
          {component}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}

export default TabsComponent
