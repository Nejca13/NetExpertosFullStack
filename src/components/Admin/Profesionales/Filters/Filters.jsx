import DateComponent from '@/components/ChakraUi/DateComponent/DateComponent'
import ResetFilters from '@/components/ChakraUi/ResetFilters/ResetFilters'
import SearchComponent from '@/components/ChakraUi/SearchComponent/SearchComponent'
import SortComponent from '@/components/ChakraUi/SortComponent/SortComponent'
import { Flex } from '@chakra-ui/react'

const Filters = ({ filters, updateFilters, resetFilters }) => {
  return (
    <Flex justifyContent='flex-start' alignItems='flex-end' gap={2}>
      {/* Buscador */}
      <SearchComponent
        id='query'
        name='query'
        placeholder='Buscar clientes..'
        updateFilters={updateFilters}
        filters={filters}
      />
      {/* Menu Sort */}
      <SortComponent filters={filters} updateFilters={updateFilters} />
      {/* Fechas */}
      <DateComponent filters={filters} updateFilters={updateFilters} />
      {/* Reset Filters */}
      <ResetFilters resetFilters={resetFilters} />
    </Flex>
  )
}

export default Filters
