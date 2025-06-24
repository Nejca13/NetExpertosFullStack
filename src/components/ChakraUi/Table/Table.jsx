'use client'

import {
  Table as ChakraTable,
  TableRoot,
  TableHeader,
  TableRow,
  TableColumnHeader,
  TableBody,
  TableCell,
} from '@chakra-ui/react'

const Table = ({ rows = [] }) => {
  if (!rows.length) return <p>No hay datos</p>

  const keys = Object.keys(rows[0])

  return (
    <TableRoot size='md' variant='outline' rounded='5px' stickyHeader>
      <TableHeader>
        <TableRow>
          {keys.map((key) => (
            <TableColumnHeader key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </TableColumnHeader>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {keys.map((key) => (
              <TableCell key={key}>{row[key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableRoot>
  )
}

export default Table
