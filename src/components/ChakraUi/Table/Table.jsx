import { Table } from '@chakra-ui/react'

const MyTable = ({ rows = [] }) => {
  if (!rows.length) return <p>No hay datos</p>

  const keys = Object.keys(rows[0])

  return (
    <Table.ScrollArea borderWidth='1px' rounded='md' height='80vh'>
      <Table.Root size='md' stickyHeader>
        <Table.Header>
          <Table.Row bg='bg.subtle'>
            {keys.map((key) => (
              <Table.ColumnHeader key={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row key={index}>
              {keys.map((key) => (
                <Table.Cell key={key}>{row[key]}</Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}

export default MyTable
