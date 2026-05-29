import { createSlice } from '@reduxjs/toolkit'

export type ThemeValue = 'light' | 'dark'

const initial: { value: ThemeValue } = {
  value: (localStorage.getItem('theme') as ThemeValue) || 'light',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: initial,
  reducers: {
    toggleTheme(state) {
      state.value = state.value === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.value)
    },
    setTheme(state, action) {
      state.value = action.payload
      localStorage.setItem('theme', state.value)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer

