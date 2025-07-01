import { Center, Spinner, Table, Text } from '@chakra-ui/react'

const TableComponent = ({ rows = [], loading }) => {
  //Muestra el spinner primero
  if (loading) {
    return (
      <Center flexGrow='1' borderWidth='1px' rounded='md'>
        <Spinner size='xl' />
      </Center>
    )
  }

  if (!rows.length)
    return (
      <Center flexGrow='1' borderWidth='1px' rounded='md'>
        <Text>No existen datos para mostrar</Text>
      </Center>
    )

  const keys = Object.keys(rows[0])

  return (
    <Table.ScrollArea borderWidth='1px' rounded='md' flexGrow='1'>
      <Table.Root size='md' stickyHeader>
        <Table.Header>
          <Table.Row bg='bg.subtle'>
            {keys.map((key, i) => (
              <Table.ColumnHeader
                key={key}
                textAlign={i === keys.length - 1 ? 'end' : 'start'}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((row, rowIndex) => (
            <Table.Row key={rowIndex}>
              {keys.map((key, i) => (
                <Table.Cell
                  key={key}
                  textAlign={i === keys.length - 1 ? 'end' : 'start'}
                >
                  {row[key]}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

export default TableComponent
