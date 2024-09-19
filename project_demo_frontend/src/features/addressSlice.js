import { createSlice } from '@reduxjs/toolkit';

// Initial state for the cart
const initialState = {
  address: [],
  addressCnt: 0,
};

const addressSlice = createSlice({
  name: 'address_info',
  initialState,
  reducers: {
    addUserAddress(state, action) {
      const newAddress = action.payload;
      console.log("newAddress", newAddress);
      
      // Find if the address already exists
      const existingAddressIndex = state.address.findIndex(item => item.address.address_id === newAddress.address.address_id);

      if (existingAddressIndex === -1) {
        // If the item doesn't exist, add it

        state.address.push({
          ...newAddress,
        });
        state.addressCnt += 1;
      } else {
        // If the address exists, update it

        state.address[existingAddressIndex] = {
          ...newAddress,
        };
      }
    },
    removeUserAddress(state, action) {
      const {addressIdToRemove} = action.payload;

      // Find the index of the address to be removed
      const existingAddressIndex = state.address.findIndex(item => item.address.address_id === addressIdToRemove);

      if (existingAddressIndex !== -1) {
        // If the address exists, remove it
        state.address.splice(existingAddressIndex, 1);
        state.addressCnt -= 1;
      }
    },
    updateUserAddress(state, action) {
      const updatedAddress = action.payload;
      console.log("updatedAddress", updatedAddress);
      
      // Find the index of the address to be updated
      const existingAddressIndex = state.address.findIndex(
        (item) => item.address.address_id === updatedAddress.address.address_id
      );
    
      if (existingAddressIndex !== -1) {
        // If the address exists, update it
        state.address[existingAddressIndex] = {
          ...updatedAddress,
        };
      } else {
        // Handle the case where the address does not exist
        console.error("Address not found. Unable to update.");
        // Optionally, you can throw an error or return here
      }
    }
    
  },
});

export const { addUserAddress, removeUserAddress, updateUserAddress} = addressSlice.actions;

export default addressSlice.reducer;
