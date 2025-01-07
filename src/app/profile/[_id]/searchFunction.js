import profesiones from '@/constants/profesiones'

const normalizeString = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export const searchFunction = (searchItems) => {
  const normalizedSearch = normalizeString(searchItems)
  const result = profesiones.filter((rubro) => {
    const rubroKey = Object.keys(rubro)[0]
    const rubroLowerCase = normalizeString(rubroKey)
    const profesionesArray = rubro[rubroKey]
    const matchesRubro = rubroLowerCase.includes(normalizedSearch)

    // Verificar si el nombre del rubro coincide
    if (matchesRubro) return true
    // Verificar si alguna de las profesiones del rubro coincide
    const matchesProfesiones = profesionesArray.some((profesion) =>
      normalizeString(profesion).includes(normalizedSearch)
    )
    return matchesProfesiones
  })

  return result
}
