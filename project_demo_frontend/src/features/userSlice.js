import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  id: "",
  email: "",
  username: "",
  get_avatar: "",
}

export const userSlice = createSlice({
  name: 'user_info',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.id = action.payload.id
      state.email = action.payload.email
      state.username = action.payload.username
      state.get_avatar = action.payload.get_avatar
    },
    unsetUserInfo: (state, action) => {
      state.id = action.payload.id
      state.email = action.payload.email
      state.username = action.payload.username
      state.get_avatar = action.payload.get_avatar
    },

  }
})

export const { setUserInfo, unsetUserInfo } = userSlice.actions

export default userSlice.reducer