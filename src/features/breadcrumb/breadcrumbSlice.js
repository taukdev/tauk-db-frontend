import { createSlice } from "@reduxjs/toolkit";

const breadcrumbSlice = createSlice({
  name: "breadcrumbs",
  initialState: [],
  reducers: {
    setBreadcrumbs: (state, action) => {
      return action.payload; // overwrite with new breadcrumb array
    },
  },
});

export const { setBreadcrumbs } = breadcrumbSlice.actions;
export default breadcrumbSlice.reducer;
