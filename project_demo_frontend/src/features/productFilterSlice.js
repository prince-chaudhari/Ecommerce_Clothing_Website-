// productFilterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  category: [],
  price: { min_price: 390, max_price: 1499 },
  colors: [],
  sizes: [],
  style: [],
};

const productFilterSlice = createSlice({
  name: 'productFilter',
  initialState,
  reducers: {
    setCategory(state, action) {
      // Toggle category
      const index = state.category.indexOf(action.payload);
      if (index > -1) {
        state.category.splice(index, 1); // Remove category if exists
      } else {
        state.category.push(action.payload); // Add category if not exists
      }
    },
    setPrice(state, action) {
      state.price = action.payload;
    },
    setColors(state, action) {
      // Toggle category
      const index = state.colors.indexOf(action.payload);
      if (index > -1) {
        state.colors.splice(index, 1); // Remove category if exists
      } else {
        state.colors.push(action.payload); // Add category if not exists
      }
    },
    setSizes(state, action) {
      // Toggle category
      const index = state.sizes.indexOf(action.payload);
      if (index > -1) {
        state.sizes.splice(index, 1); // Remove category if exists
      } else {
        state.sizes.push(action.payload); // Add category if not exists
      }
    },
    setStyle(state, action) {
      state.style = action.payload;
    },
  },
});

export const { setCategory, setPrice, setColors, setSizes, setStyle } = productFilterSlice.actions;
export default productFilterSlice.reducer;
