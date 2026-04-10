// features/reports/LeadDeliveryReportSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLeadDeliveryDropdownApi,
  generateLeadDeliveryReportApi,
} from '../../api/reports';

// Async thunk to fetch dropdown data
export const fetchLeadDeliveryDropdown = createAsyncThunk(
  'leadDeliveryReport/fetchDropdown',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLeadDeliveryDropdownApi(params);
      return response?.data || {};
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
    selectedVendors: [],
    selectedLists: [],
    subtractReturnedLeads: false,
    vendors: [],
    lists: [],
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
    addSelectedVendor: (state, action) => {
      if (!state.selectedVendors.includes(action.payload)) {
        state.selectedVendors.push(action.payload);
      }
    },
    removeSelectedVendor: (state, action) => {
      state.selectedVendors = state.selectedVendors.filter(
        (v) => v !== action.payload
      );
    },
    setSelectedVendors: (state, action) => {
      state.selectedVendors = action.payload;
    },
    clearSelectedVendors: (state) => {
      state.selectedVendors = [];
      state.selectedLists = [];
      state.lists = [];
    },
    addSelectedList: (state, action) => {
      if (!state.selectedLists.includes(action.payload)) {
        state.selectedLists.push(action.payload);
      }
    },
    removeSelectedList: (state, action) => {
      state.selectedLists = state.selectedLists.filter(
        (l) => l !== action.payload
      );
    },
    setSelectedLists: (state, action) => {
      state.selectedLists = action.payload;
    },
    clearSelectedLists: (state) => {
      state.selectedLists = [];
      state.lists = [];
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
        if (action.payload.vendors) {
          state.vendors = action.payload.vendors;
        }
        if (action.payload.lists) {
          state.lists = action.payload.lists;
        }
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
  addSelectedVendor,
  removeSelectedVendor,
  setSelectedVendors,
  clearSelectedVendors,
  addSelectedList,
  removeSelectedList,
  setSelectedLists,
  clearSelectedLists,
  setSubtractReturnedLeads,
} = leadDeliveryReportSlice.actions;

export default leadDeliveryReportSlice.reducer;