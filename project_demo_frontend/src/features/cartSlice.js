import { createSlice } from '@reduxjs/toolkit';

// Initial state for the cart
const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalPrice: 0,
  cartCnt: 0,
  discount: 0,  // Field for discount percentage
  isDiscounted: false,
  appliedCoupons: [],  // New field to track applied coupons
};

// Helper function to recalculate total price with discount
const recalculateTotal = (state) => {
  let total = 0;
  state.cartItems.forEach(item => {
    total += parseInt(item.product.price) * parseInt(item.quantity);
  });
  state.totalPrice = total;

  // Apply the discount if applicable
  if (state.isDiscounted && state.discount > 0) {
    state.totalPrice = state.totalPrice * (1 - (state.discount / 100));
  }
};


const cartSlice = createSlice({
  name: 'cart_info',
  initialState,
  reducers: {
    addItemToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(item => item.product.pid === newItem.product.pid);

      if (!existingItem) {
        state.cartItems.push({ ...newItem });
        state.totalQuantity += parseInt(newItem.quantity);
        state.cartCnt += 1;
      } else {
        const existingItemAgain = state.cartItems.find(item => item.product.pid === newItem.product.pid && item.size.toLowerCase() === newItem.size.toLowerCase());
        if (existingItemAgain) {
          existingItemAgain.quantity += parseInt(newItem.quantity);
        } else {
          state.cartItems.push({ ...newItem });
          state.cartCnt += 1;
        }
      }

      // Recalculate total after adding item
      recalculateTotal(state);
    },
    removeItemFromCart(state, action) {
      const { id } = action.payload;
      const existingItem = state.cartItems.find(item => item.cart_id === id);

      if (existingItem) {
        state.totalQuantity -= parseInt(existingItem.quantity);
        state.cartItems = state.cartItems.filter(item => item.cart_id !== id);
        state.cartCnt -= 1;

        // Recalculate total after removing item
        recalculateTotal(state);
      }

      // Check if cart is empty and reset discount fields
      if (state.cartItems.length === 0) {
        state.discount = 0;
        state.isDiscounted = false;
        state.appliedCoupons = [];  // Reset coupons when cart is empty
      }
    },
    updateItemQuantity(state, action) {
      const { id, quantity } = action.payload;
      const existingItem = state.cartItems.find(item => item.cart_id === id);

      if (existingItem) {
        state.totalQuantity += parseInt(quantity) - parseInt(existingItem.quantity);
        existingItem.quantity = parseInt(quantity);

        // Recalculate total after updating quantity
        recalculateTotal(state);
      }
    },
    setDiscount(state, action) {
      const { discountPercentage, coupons } = action.payload;  // Expect both discount and applied coupons
      state.discount = discountPercentage;
      state.isDiscounted = true;
      state.appliedCoupons = coupons;  // Store applied coupons

      // Recalculate total with new discount
      recalculateTotal(state);
    },

    clearCart(state) {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.cartCnt = 0;
      state.discount = 0;
      state.isDiscounted = false;
      state.appliedCoupons = [];  // Clear coupons
    },
  },
});

export const { addItemToCart, removeItemFromCart, updateItemQuantity, clearCart, setDiscount } = cartSlice.actions;

export default cartSlice.reducer;
