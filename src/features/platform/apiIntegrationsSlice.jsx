import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiIntegrationsApi, deleteApiIntegrationApi } from "../../api/platforms";

export const fetchApiIntegrations = createAsyncThunk(
  "apiIntegrations/fetch",
  async (platformId, { rejectWithValue }) => {
    try {
      const response = await getApiIntegrationsApi(platformId);
      return response?.data?.integrations || response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch api integrations");
    }
  }
);

export const deleteApiIntegration = createAsyncThunk(
  "apiIntegrations/delete",
  async ({ platformId, integrationId }, { rejectWithValue }) => {
    try {
      await deleteApiIntegrationApi(platformId, integrationId);
      return integrationId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete api integration");
    }
  }
);

const initialState = {
  integrations: [],
  loading: false,
  error: null,
};

const apiIntegrationsSlice = createSlice({
  name: "apiIntegrations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchApiIntegrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiIntegrations.fulfilled, (state, action) => {
        state.loading = false;
        state.integrations = action.payload;
      })
      .addCase(fetchApiIntegrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteApiIntegration.fulfilled, (state, action) => {
        state.integrations = state.integrations.filter(
          (item) => item.id !== action.payload
        );
      });
  },
});

export default apiIntegrationsSlice.reducer;
