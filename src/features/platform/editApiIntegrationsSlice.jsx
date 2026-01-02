// features/platform/editApiIntegrationsSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createApiIntegrationApi,
  updateApiIntegrationApi,
  getApiIntegrationByIdApi
} from "../../api/platforms";

export const createApiIntegration = createAsyncThunk(
  "editApiIntegrations/create",
  async ({ platformId, payload }, { rejectWithValue }) => {
    try {
      const response = await createApiIntegrationApi(platformId, payload);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create api integration");
    }
  }
);

export const updateApiIntegration = createAsyncThunk(
  "editApiIntegrations/update",
  async ({ platformId, integrationId, payload }, { rejectWithValue }) => {
    try {
      const response = await updateApiIntegrationApi(platformId, integrationId, payload);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update api integration");
    }
  }
);

export const fetchApiIntegrationById = createAsyncThunk(
  "editApiIntegrations/fetchById",
  async ({ platformId, integrationId }, { rejectWithValue }) => {
    try {
      const response = await getApiIntegrationByIdApi(platformId, integrationId);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch api integration details");
    }
  }
);

const initialState = {
  currentIntegration: null,
  loading: false,
  error: null,
  success: false,
};

const editApiIntegrationsSlice = createSlice({
  name: "editApiIntegrations",
  initialState,
  reducers: {
    setCurrentIntegration: (state, action) => {
      state.currentIntegration = action.payload;
    },
    updateIntegrationLocal: (state, action) => {
      state.currentIntegration = { ...state.currentIntegration, ...action.payload };
    },
    resetEditState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentIntegration = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createApiIntegration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createApiIntegration.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createApiIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateApiIntegration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateApiIntegration.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateApiIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By ID
      .addCase(fetchApiIntegrationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiIntegrationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentIntegration = action.payload;
      })
      .addCase(fetchApiIntegrationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentIntegration, updateIntegrationLocal, resetEditState } = editApiIntegrationsSlice.actions;
export default editApiIntegrationsSlice.reducer;