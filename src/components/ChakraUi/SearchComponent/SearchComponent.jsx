import LuSearch from '@/assets/icon/LuSearch'
import { Input, InputGroup } from '@chakra-ui/react'

const SearchComponent = ({ name, id, placeholder, filters, updateFilters }) => {
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
        onChange={(e) => updateFilters({ query: e.target.value })}
        size='sm'
        value={filters?.query || ''}
      />
    </InputGroup>
  )
}

export default SearchComponent
