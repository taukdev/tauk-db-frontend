import { createSlice } from '@reduxjs/toolkit';

// Define the initial state for the SendLeads form
const initialState = {
  blockBadWords: false,
  genderComplete: false,
  appendMissingFields: false,
  listflexAppendService: false,
  dedupeAgainst: 'reset',
  dedupeBack: '1 Days',
  requiredFields: [],
  allowedCountries: '',
  listType: 'import',
  redirectAfterImport: false,
};

// Create the slice
const sendLeadsSlice = createSlice({
  name: 'sendLeads',
  initialState,
  reducers: {
    setFormValues: (state, action) => {
      // This will allow us to update form values in the Redux store
      return { ...state, ...action.payload };
    },
    resetFormValues: () => initialState, // Reset form values to initial state
  },
});

// Export the actions to be dispatched
export const { setFormValues, resetFormValues } = sendLeadsSlice.actions;

// Export the reducer to be added to the store
export default sendLeadsSlice.reducer;
