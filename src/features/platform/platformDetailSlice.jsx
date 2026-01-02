import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPlatformByIdApi, updatePlatformApi, activatePlatformApi, deactivatePlatformApi } from "../../api/platforms";

export const fetchPlatformDetail = createAsyncThunk(
  "platformDetail/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getPlatformByIdApi(id);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch platform detail");
    }
  }
);

export const updatePlatformDetail = createAsyncThunk(
  "platformDetail/updateDetail",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await updatePlatformApi(id, payload);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update platform");
    }
  }
);

export const activatePlatform = createAsyncThunk(
  "platformDetail/activate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await activatePlatformApi(id);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to activate platform");
    }
  }
);

export const deactivatePlatform = createAsyncThunk(
  "platformDetail/deactivate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deactivatePlatformApi(id);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to deactivate platform");
    }
  }
);

const initialState = {
  selectedPlatform: null,
  loading: false,
  error: null,
};

const platformDetailSlice = createSlice({
  name: "platformDetail",
  initialState,
  reducers: {
    setPlatformDetail: (state, action) => {
      state.selectedPlatform = action.payload;
    },
    clearPlatformDetail: (state) => {
      state.selectedPlatform = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlatform = action.payload;
      })
      .addCase(fetchPlatformDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePlatformDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePlatformDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPlatform = action.payload;
      })
      .addCase(updatePlatformDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(activatePlatform.fulfilled, (state, action) => {
        state.selectedPlatform = action.payload;
      })
      .addCase(deactivatePlatform.fulfilled, (state, action) => {
        state.selectedPlatform = action.payload;
      });
  },
});

export const { setPlatformDetail, clearPlatformDetail } =
  platformDetailSlice.actions;

export default platformDetailSlice.reducer;
