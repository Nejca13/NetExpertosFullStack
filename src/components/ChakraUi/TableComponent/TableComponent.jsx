import { Table } from '@chakra-ui/react'

const TableComponent = ({ rows = [] }) => {
  if (!rows.length) return <p>No hay datos</p>

  const keys = Object.keys(rows[0])

  return (
    <Table.ScrollArea borderWidth='1px' rounded='md' height='80vh'>
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
