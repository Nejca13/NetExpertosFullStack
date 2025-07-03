'use client'
import { useRef } from 'react'
import LuSearch from '@/assets/icon/LuSearch'
import { Input, InputGroup } from '@chakra-ui/react'

const SearchComponent = ({ name, id, placeholder, filters, updateFilters }) => {
  const timeoutRef = useRef(null)

  const handleChange = (e) => {
    const value = e.target.value

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      updateFilters({ query: value })
    }, 600)
  }

  return (
    <InputGroup
      maxW='300px'
      startElement={<LuSearch />}
      css={{
        _icon: {
          width: '4',
          height: '4',
        },
      }}
    >
      <Input
        type='search'
        name={name}
        id={id}
        placeholder={placeholder}
        onChange={handleChange}
        size='sm'
        defaultValue={filters?.query || ''}
      />
    </InputGroup>
  )
}

export default SearchComponent
