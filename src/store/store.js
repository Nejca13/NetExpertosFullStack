import { create } from 'zustand'

const useStore = create((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}))

export default useStore
