// features/reports/LeadDeliveryReportSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLeadDeliveryDropdownApi,
  generateLeadDeliveryReportApi,
} from '../../api/reports';

// Async thunk to fetch dropdown data
export const fetchLeadDeliveryDropdown = createAsyncThunk(
  'leadDeliveryReport/fetchDropdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLeadDeliveryDropdownApi();
      // Handle response structure: { status: "success", data: { platforms: [...] } }
      if (response?.data?.platforms && Array.isArray(response.data.platforms)) {
        return response.data.platforms;
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
export const generateLeadDeliveryReport = createAsyncThunk(
  'leadDeliveryReport/generateReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await generateLeadDeliveryReportApi(payload);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate report');
    }
  }
);

const leadDeliveryReportSlice = createSlice({
  name: 'leadDeliveryReport',
  initialState: {
    searchQuery: '',
    showPanel: false,
    startDate: '',
    endDate: '',
    selectedPlatforms: [],
    leadType: 'Abandons Leads',
    subtractReturnedLeads: false,
    platforms: [],
    // Dropdown data
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
    setShowPanel: (state, action) => {
      state.showPanel = action.payload;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    addSelectedPlatform: (state, action) => {
      if (!state.selectedPlatforms.includes(action.payload)) {
        state.selectedPlatforms.push(action.payload);
      }
    },
    removeSelectedPlatform: (state, action) => {
      state.selectedPlatforms = state.selectedPlatforms.filter(
        (platform) => platform !== action.payload
      );
    },
    setSelectedPlatforms: (state, action) => {
      state.selectedPlatforms = action.payload;
    },
    clearSelectedPlatforms: (state) => {
      state.selectedPlatforms = [];
    },
    setLeadType: (state, action) => {
      state.leadType = action.payload;
    },
    setSubtractReturnedLeads: (state, action) => {
      state.subtractReturnedLeads = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dropdown fetch
      .addCase(fetchLeadDeliveryDropdown.pending, (state) => {
        state.dropdownLoading = true;
        state.dropdownError = null;
      })
      .addCase(fetchLeadDeliveryDropdown.fulfilled, (state, action) => {
        state.dropdownLoading = false;
        state.platforms = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchLeadDeliveryDropdown.rejected, (state, action) => {
        state.dropdownLoading = false;
        state.dropdownError = action.payload;
      })
      // Report generation
      .addCase(generateLeadDeliveryReport.pending, (state) => {
        state.reportLoading = true;
        state.reportError = null;
      })
      .addCase(generateLeadDeliveryReport.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.reportData = action.payload;
      })
      .addCase(generateLeadDeliveryReport.rejected, (state, action) => {
        state.reportLoading = false;
        state.reportError = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setShowPanel,
  setStartDate,
  setEndDate,
  addSelectedPlatform,
  removeSelectedPlatform,
  setSelectedPlatforms,
  clearSelectedPlatforms,
  setLeadType,
  setSubtractReturnedLeads,
} = leadDeliveryReportSlice.actions;

export default leadDeliveryReportSlice.reducer;