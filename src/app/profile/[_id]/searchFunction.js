import profesiones from '@/constants/profesiones'

const normalizeString = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export const searchFunction = (searchItems) => {
  const normalizedSearch = normalizeString(searchItems)

  const result = profesiones
    .map((rubro) => {
      const rubroKey = Object.keys(rubro)[0]
      const rubroLowerCase = normalizeString(rubroKey)
      const profesionesArray = rubro[rubroKey]

      const matchesRubro = rubroLowerCase.includes(normalizedSearch)

      if (matchesRubro) return { [rubroKey]: profesionesArray }

      const matchedProfesiones = profesionesArray.filter((profesion) =>
        normalizeString(profesion).includes(normalizedSearch)
      )

      if (matchedProfesiones.length > 0) {
        return { [rubroKey]: matchedProfesiones }
      }

      return null
    })
    .filter(Boolean)

  return result
}
