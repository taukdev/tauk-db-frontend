import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getPlatformOrderByIdApi } from "../../api/platforms";

// Fetch order details
export const fetchOrderDetails = createAsyncThunk(
  "orderDetail/fetchDetails",
  async ({ platformId, orderId }, { rejectWithValue }) => {
    try {
      const response = await getPlatformOrderByIdApi(platformId, orderId);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch order details");
    }
  }
);

// Mock fetch daily delivery breakdown
export const fetchDailyDeliveryBreakdown = createAsyncThunk(
  "orderDetail/fetchDailyBreakdown",
  async (orderId) => {
    // Mock data - replace with actual API call
    return [
      { date: "2023-06-05", leadsDelivered: 2 },
      { date: "2023-06-06", leadsDelivered: 86 },
      { date: "2023-06-07", leadsDelivered: 83 },
      { date: "2023-06-08", leadsDelivered: 84 },
      { date: "2023-06-09", leadsDelivered: 86 },
      { date: "2023-06-10", leadsDelivered: 87 },
      { date: "2023-06-11", leadsDelivered: 86 },
      { date: "2023-06-12", leadsDelivered: 84 },
      { date: "2023-06-13", leadsDelivered: 37 },
      { date: "2023-06-14", leadsDelivered: 89 },
      { date: "2023-06-15", leadsDelivered: 92 },
      { date: "2023-06-16", leadsDelivered: 88 },
    ];
  }
);

const initialState = {
  orderDetails: null,
  dailyBreakdown: [],
  loading: false,
  error: null,
};

const orderDetailSlice = createSlice({
  name: "orderDetail",
  initialState,
  reducers: {
    updateOrderNotes: (state, action) => {
      if (state.orderDetails) {
        state.orderDetails.orderNotes = action.payload;
      }
    },
    updateInternalViewOnly: (state, action) => {
      if (state.orderDetails) {
        state.orderDetails.internalViewOnly = action.payload;
      }
    },
    updatePricePerLead: (state, action) => {
      if (state.orderDetails) {
        state.orderDetails.pricePerLead = action.payload;
      }
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
      state.dailyBreakdown = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Map API response (snake_case) to component format (camelCase)
        const payload = action.payload || {};
        state.orderDetails = {
          ...payload,
          // Map common fields from snake_case to camelCase
          leadOrderId: payload.lead_order_id || payload.leadOrderId || payload.id,
          platformId: payload.platform_id || payload.platformId || payload.Platform?.id,
          // Map platform name from various possible locations
          platform: payload.Platform?.platform_name || 
                   payload.platform || 
                   payload.platform_name || 
                   (payload.Platform ? "N/A" : "N/A"),
          dateEntered: payload.date_entered || payload.dateEntered || payload.created_at,
          leadsDelivered: payload.leads_delivered !== undefined && payload.leads_delivered !== null 
            ? payload.leads_delivered 
            : (payload.leadsDelivered !== undefined && payload.leadsDelivered !== null 
              ? payload.leadsDelivered 
              : 0),
          pricePerLead: payload.price_per_lead !== undefined && payload.price_per_lead !== null
            ? payload.price_per_lead
            : (payload.pricePerLead !== undefined && payload.pricePerLead !== null
              ? payload.pricePerLead
              : 0.0),
          dedupeBackDays: payload.dedupe_back_days || payload.dedupeBackDays || "N/A",
          fieldSelectionType: payload.field_selection_type || payload.fieldSelectionType || "N/A",
          signupDates: payload.signup_dates || payload.signupDates || "N/A",
          countries: payload.countries || "N/A",
          areaCodes: payload.area_codes || payload.areaCodes || "N/A",
          gender: payload.gender || "N/A",
          offerUrl: payload.offer_url || payload.offerUrl || "N/A",
          // Map lists from various possible API field names
          lists: payload.lists || payload.list_names || payload.listIds || payload.list_ids || [],
          disregardLocks: payload.disregard_locks || payload.disregardLocks || "N/A",
          // Handle excluded_states - can be string or array
          excludedStates: payload.excluded_states || payload.excludedStates || "N/A",
          // If excluded_states exists, it means states are excluded
          excludeStates: (payload.excluded_states && payload.excluded_states !== "N/A") ? true : false,
          // selected_states might not be in response if excluded_states is used
          selectedStates: payload.selected_states || payload.selectedStates || payload.states || [],
          excludedESPs: payload.excluded_esps || payload.excludedESPs || "N/A",
          includedESPs: payload.included_esps || payload.includedESPs || "N/A",
          // Import dates - combine from and to dates if available
          importDates: (() => {
            // Check if we have separate from/to dates
            const importFrom = payload.import_dates_from || payload.importDatesFrom;
            const importTo = payload.import_dates_to || payload.importDatesTo;
            if (importFrom && importTo) {
              // Format dates: convert ISO to readable format
              const fromDate = new Date(importFrom);
              const toDate = new Date(importTo);
              if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
                const formatDate = (date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  const seconds = String(date.getSeconds()).padStart(2, '0');
                  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                };
                return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
              }
              return `${importFrom} to ${importTo}`;
            }
            // Fallback to combined import_dates field if available
            return payload.import_dates || payload.importDates || "N/A";
          })(),
          orderType: payload.order_type || payload.orderType || payload.order_kind || "N/A",
          isTestFile: payload.is_test_file !== undefined ? payload.is_test_file : payload.isTestFile,
          internalViewOnly: payload.internal_view_only !== undefined ? payload.internal_view_only : payload.internalViewOnly,
          orderNotes: payload.order_notes || payload.orderNotes || "",
        };
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch daily breakdown
      .addCase(fetchDailyDeliveryBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyDeliveryBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyBreakdown = action.payload;
      })
      .addCase(fetchDailyDeliveryBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  updateOrderNotes,
  updateInternalViewOnly,
  updatePricePerLead,
  clearOrderDetails,
} = orderDetailSlice.actions;

export default orderDetailSlice.reducer;

