'use client'

import { ButtonGroup, IconButton, Pagination } from '@chakra-ui/react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

const PaginationComponent = ({ total, page, limit, updateFilters }) => {
  return (
    <Pagination.Root
      count={total}
      page={page}
      pageSize={limit}
      onPageChange={(e) => updateFilters({ page: e.page })}
      display='flex'
      justifyContent='flex-end'
    >
      <ButtonGroup variant='surface' size='sm'>
        <Pagination.PrevTrigger asChild>
          <IconButton>
            <LuChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(page) => (
            <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
              {page.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton>
            <LuChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  )
}

export default PaginationComponent
