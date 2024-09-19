import { createSlice } from '@reduxjs/toolkit';

// Initial state for the cart
const initialState = {
  wishlistItems: [],
  wishlistCnt : 0,
};

const wishlistSlice = createSlice({
  name: 'wishlist_info',
  initialState,
  reducers: {
    addItemToWishlist(state, action) {
      const newItem = action.payload;

      const existingItem = state.wishlistItems.find(item => item.product.pid === newItem.product.pid);
      if (!existingItem) {
        // If the item doesn't exist in the cart, add it
        state.wishlistItems.push({
          ...newItem,
        });
        state.wishlistCnt += 1
      } 
    },
    removeItemFromWishlist(state, action) {
      const {id} = action.payload;
      
      const existingItem = state.wishlistItems.find(item => item.wishlist_id === id);
      if (existingItem) {
        state.wishlistItems = state.wishlistItems.filter(item => item.wishlist_id !== id);
        state.wishlistCnt -= 1
      }
    },
    clearWishlist(state) {
      state.wishlistItems = [];
      state.wishlistCnt = 0;
    },
  },
});

export const { addItemToWishlist, removeItemFromWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
