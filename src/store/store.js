import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // usuario
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      clearCurrentUser: () => set({ currentUser: null }),
    }),
    {
      name: 'store',
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
)

export default useStore
