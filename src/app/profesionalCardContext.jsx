'use client'

import { createContext, useContext, useState } from 'react'

const ProfesionalCardContext = createContext(null)

export function ProfesionalCardProvider({ children }) {
  const [showProfesionalCard, setShowProfesionalCard] = useState(false)

  return (
    <ProfesionalCardContext.Provider
      value={[showProfesionalCard, setShowProfesionalCard]}
    >
      {children}
    </ProfesionalCardContext.Provider>
  )
}

export const useShowProfesionalCard = () => useContext(ProfesionalCardContext)
