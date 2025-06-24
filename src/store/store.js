import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Inicializar hasHydrated en true si previa existe
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      // usuario
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      clearCurrentUser: () => set({ currentUser: null }),

      //Secciones del dashboard
      typeSection: 'clientes',
      setTypeSection: (typeSection) =>
        set(() => ({ typeSection: typeSection })),
    }),
    {
      name: 'store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        typeSection: state.typeSection,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export default useStore
