import { createSlice } from "@reduxjs/toolkit";

const addPlatformSlice = createSlice({
  name: "addPlatform",
  initialState: {
    showAddPlatform: false, 
  },
  reducers: {
    openAddPlatform: (state) => {
      state.showAddPlatform = true;
    },
    closeAddPlatform: (state) => {
      state.showAddPlatform = false;
    },
  },
});

export const { openAddPlatform, closeAddPlatform } = addPlatformSlice.actions;
export default addPlatformSlice.reducer;