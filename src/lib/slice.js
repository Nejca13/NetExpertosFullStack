import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    loginUser: (state, action) => {
      return action.payload
    },
    logoutUser: (state) => null,
  },
})

export const { loginUser, logoutUser } = userSlice.actions

export default userSlice.reducer
