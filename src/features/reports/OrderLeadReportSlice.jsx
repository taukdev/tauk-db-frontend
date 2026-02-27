import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPlatformOrderLeadReportApi } from "../../api/platforms";

export const fetchOrderLeadReport = createAsyncThunk(
    "orderLeadReport/fetchReport",
    async ({ platformId, orderId, params }, { rejectWithValue }) => {
        try {
            const response = await getPlatformOrderLeadReportApi(platformId, orderId, params);
            return response?.data || response;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch lead report");
        }
    }
);

const initialState = {
    reportData: null,
    loading: false,
    error: null,
    startDate: "",
    endDate: "",
};

const orderLeadReportSlice = createSlice({
    name: "orderLeadReport",
    initialState,
    reducers: {
        clearReportData: (state) => {
            state.reportData = null;
            state.loading = false;
            state.error = null;
        },
        setStartDate: (state, action) => {
            state.startDate = action.payload;
        },
        setEndDate: (state, action) => {
            state.endDate = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderLeadReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderLeadReport.fulfilled, (state, action) => {
                state.loading = false;
                state.reportData = action.payload;
            })
            .addCase(fetchOrderLeadReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { clearReportData, setStartDate, setEndDate } = orderLeadReportSlice.actions;
export default orderLeadReportSlice.reducer;
