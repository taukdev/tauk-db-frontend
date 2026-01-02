import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateScrubReportApi } from '../../api/reports';

// Async thunk to generate scrub report
export const generateScrubReport = createAsyncThunk(
    'scrubReport/generateReport',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await generateScrubReportApi(payload);
            return response?.data || response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to generate report');
        }
    }
);

const initialState = {
    searchText: '',
    showFilter: false,
    startDate: '',
    endDate: '',
    loading: false,
    error: null,
    reportData: null,
    reportLoading: false,
    reportError: null,
};

const scrubReportSlice = createSlice({
    name: 'scrubReport',
    initialState,
    reducers: {
        setSearchText: (state, action) => {
            state.searchText = action.payload;
        },
        toggleFilter: (state) => {
            state.showFilter = !state.showFilter;
        },
        setShowPanel: (state, action) => {
            state.showFilter = action.payload;
        },
        setStartDate: (state, action) => {
            state.startDate = action.payload;
        },
        setEndDate: (state, action) => {
            state.endDate = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setReportData: (state, action) => {
            state.reportData = action.payload;
        },
        resetFilters: (state) => {
            state.startDate = '';
            state.endDate = '';
            state.searchText = '';
        }
    },
    extraReducers: (builder) => {
        builder
            // Report generation
            .addCase(generateScrubReport.pending, (state) => {
                state.reportLoading = true;
                state.reportError = null;
            })
            .addCase(generateScrubReport.fulfilled, (state, action) => {
                state.reportLoading = false;
                state.reportData = action.payload;
            })
            .addCase(generateScrubReport.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload;
            });
    }
});

export const {
    setSearchText,
    toggleFilter,
    setShowPanel,
    setStartDate,
    setEndDate,
    setLoading,
    setError,
    setReportData,
    resetFilters
} = scrubReportSlice.actions;

// Selectors
export const selectScrubReport = (state) => state.scrubReport;
export const selectSearchText = (state) => state.scrubReport.searchText;
export const selectShowFilter = (state) => state.scrubReport.showFilter;
export const selectStartDate = (state) => state.scrubReport.startDate;
export const selectEndDate = (state) => state.scrubReport.endDate;
export const selectLoading = (state) => state.scrubReport.loading;
export const selectError = (state) => state.scrubReport.error;
export const selectReportData = (state) => state.scrubReport.reportData;

export default scrubReportSlice.reducer;