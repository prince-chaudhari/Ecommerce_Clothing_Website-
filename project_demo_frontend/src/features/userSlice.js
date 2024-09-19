import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  id: "",
  email: "",
  username: "",
  get_avatar: "",
  date_of_birth: "",
  gender: "",
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
      state.date_of_birth = action.payload.date_of_birth
      state.gender = action.payload.gender
    },
    unsetUserInfo: (state, action) => {
      state.id = action.payload.id
      state.email = action.payload.email
      state.username = action.payload.username
      state.get_avatar = action.payload.get_avatar
      state.date_of_birth = action.payload.date_of_birth
      state.gender = action.payload.gender
    },

  }
})

export const { setUserInfo, unsetUserInfo } = userSlice.actions

export default userSlice.reducer