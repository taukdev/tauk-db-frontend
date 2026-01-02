// features/reports/ListImportStateSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getListImportStatsDropdownApi,
  generateListImportStatsReportApi,
} from '../../api/reports';

// Async thunk to fetch dropdown data
export const fetchListImportStatsDropdown = createAsyncThunk(
  'listImportStates/fetchDropdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getListImportStatsDropdownApi();
      // Handle response structure: { status: "success", data: { lists: [...] } }
      if (response?.data?.lists && Array.isArray(response.data.lists)) {
        return response.data.lists;
      }
      // Fallback for other structures
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dropdown data');
    }
  }
);

// Async thunk to generate report
export const generateListImportStatsReport = createAsyncThunk(
  'listImportStates/generateReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await generateListImportStatsReportApi(payload);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate report');
    }
  }
);

const listImportStateSlice = createSlice({
  name: 'listImportStates',
  initialState: {
    data: [],
    loading: false,
    error: null,
    searchQuery: '',
    // UI / filter state
    startDate: '',
    endDate: '',
    showPanel: false,
    selectedLists: [],
    // Dropdown data
    dropdownOptions: [],
    dropdownLoading: false,
    dropdownError: null,
    // Report data
    reportData: null,
    reportLoading: false,
    reportError: null,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    setShowPanel: (state, action) => {
      state.showPanel = action.payload;
    },
    addSelectedList: (state, action) => {
      if (!state.selectedLists.includes(action.payload)) {
        state.selectedLists.push(action.payload);
      }
    },
    removeSelectedList: (state, action) => {
      state.selectedLists = state.selectedLists.filter((i) => i !== action.payload);
    },
    setSelectedLists: (state, action) => {
      state.selectedLists = action.payload;
    },
    clearSelectedLists: (state) => {
      state.selectedLists = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Dropdown fetch
      .addCase(fetchListImportStatsDropdown.pending, (state) => {
        state.dropdownLoading = true;
        state.dropdownError = null;
      })
      .addCase(fetchListImportStatsDropdown.fulfilled, (state, action) => {
        state.dropdownLoading = false;
        state.dropdownOptions = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchListImportStatsDropdown.rejected, (state, action) => {
        state.dropdownLoading = false;
        state.dropdownError = action.payload;
      })
      // Report generation
      .addCase(generateListImportStatsReport.pending, (state) => {
        state.reportLoading = true;
        state.reportError = null;
      })
      .addCase(generateListImportStatsReport.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.reportData = action.payload;
      })
      .addCase(generateListImportStatsReport.rejected, (state, action) => {
        state.reportLoading = false;
        state.reportError = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setStartDate,
  setEndDate,
  setShowPanel,
  addSelectedList,
  removeSelectedList,
  setSelectedLists,
  clearSelectedLists,
} = listImportStateSlice.actions;
export default listImportStateSlice.reducer;
