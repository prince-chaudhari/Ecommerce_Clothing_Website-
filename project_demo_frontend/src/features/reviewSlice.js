import { createSlice } from '@reduxjs/toolkit';

// Initial state for the reviews
const initialState = {
  reviews: [],
  totalReviews: 0,
};

const reviewSlice = createSlice({
  name: 'review_info',
  initialState,
  reducers: {
    // Add a new review
    addReview: (state, action) => {
      state.reviews.push(action.payload);
      state.totalReviews += 1;
    },

    // Remove a review by id
    removeReview: (state, action) => {
      const id = action.payload;
      state.reviews = state.reviews.filter(review => review.id !== id);
      state.totalReviews -= 1;
    },

    // Update a review by id
    updateReview: (state, action) => {
      const { id, updatedReview } = action.payload;
      const index = state.reviews.findIndex(review => review.id === id);
      if (index !== -1) {
        state.reviews[index] = { ...state.reviews[index], ...updatedReview };
      }
    },
  },
});

export const { addReview, removeReview, updateReview } = reviewSlice.actions;

export default reviewSlice.reducer;
