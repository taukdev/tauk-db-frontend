import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPlatformOrderByIdApi } from "../../api/platforms";

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

export const fetchDailyDeliveryBreakdown = createAsyncThunk(
  "orderDetail/fetchDailyBreakdown",
  async (orderId) => {
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
  loadingOrder: false,      // ← separate loading for order
  loadingBreakdown: false,  // ← separate loading for breakdown
  loading: false,           // ← kept for backward compat (derived)
  error: null,
};

const orderDetailSlice = createSlice({
  name: "orderDetail",
  initialState,
  reducers: {
    updateOrderNotes: (state, action) => {
      if (state.orderDetails) state.orderDetails.orderNotes = action.payload;
    },
    updateInternalViewOnly: (state, action) => {
      if (state.orderDetails) state.orderDetails.internalViewOnly = action.payload;
    },
    updatePricePerLead: (state, action) => {
      if (state.orderDetails) state.orderDetails.pricePerLead = action.payload;
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
      state.dailyBreakdown = [];
      state.loadingOrder = false;
      state.loadingBreakdown = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loadingOrder = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loadingOrder = false;
        state.loading = state.loadingBreakdown;
        const payload = action.payload || {};
        state.orderDetails = {
          ...payload,
          leadOrderId: payload.lead_order_id || payload.leadOrderId || payload.id,
          platformId: payload.platform_id || payload.platformId || payload.Platform?.id,
          platform:
            payload.Platform?.platform_name ||
            payload.platform ||
            payload.platform_name ||
            "N/A",
          dateEntered: payload.date_entered || payload.dateEntered || payload.created_at,
          leadsDelivered:
            payload.leads_delivered ?? payload.leadsDelivered ?? 0,
          pricePerLead:
            payload.price_per_lead ?? payload.pricePerLead ?? 0.0,
          dedupeBackDays: payload.dedupe_back_days || payload.dedupeBackDays || "N/A",
          fieldSelectionType: payload.field_selection_type || payload.fieldSelectionType || "N/A",
          signupDates: payload.signup_dates || payload.signupDates || "N/A",
          countries: payload.countries || "N/A",
          areaCodes: payload.area_codes || payload.areaCodes || "N/A",
          gender: payload.gender || "N/A",
          offerUrl: payload.offer_url || payload.offerUrl || "N/A",
          lists: payload.lists || payload.list_names || payload.listIds || payload.list_ids || [],
          disregardLocks: payload.disregard_locks || payload.disregardLocks || "N/A",
          excludedStates: payload.excluded_states || payload.excludedStates || "N/A",
          excludeStates:
            payload.excluded_states && payload.excluded_states !== "N/A"
              ? true
              : false,
          selectedStates:
            payload.selected_states || payload.selectedStates || payload.states || [],
          excludedESPs: payload.excluded_esps || payload.excludedESPs || "N/A",
          includedESPs: payload.included_esps || payload.includedESPs || "N/A",
          importDates: (() => {
            const importFrom = payload.import_dates_from || payload.importDatesFrom;
            const importTo = payload.import_dates_to || payload.importDatesTo;
            if (importFrom && importTo) {
              const fromDate = new Date(importFrom);
              const toDate = new Date(importTo);
              if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
                const formatDate = (date) => {
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, "0");
                  const d = String(date.getDate()).padStart(2, "0");
                  const hh = String(date.getHours()).padStart(2, "0");
                  const mm = String(date.getMinutes()).padStart(2, "0");
                  const ss = String(date.getSeconds()).padStart(2, "0");
                  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
                };
                return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
              }
              return `${importFrom} to ${importTo}`;
            }
            return payload.import_dates || payload.importDates || "N/A";
          })(),
          orderType: payload.order_type || payload.orderType || payload.order_kind || "N/A",
          isTestFile:
            payload.is_test_file !== undefined
              ? payload.is_test_file
              : payload.isTestFile,
          internalViewOnly:
            payload.internal_view_only !== undefined
              ? payload.internal_view_only
              : payload.internalViewOnly,
          orderNotes: payload.order_notes || payload.orderNotes || "",
        };
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loadingOrder = false;
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch daily breakdown
      .addCase(fetchDailyDeliveryBreakdown.pending, (state) => {
        state.loadingBreakdown = true;
      })
      .addCase(fetchDailyDeliveryBreakdown.fulfilled, (state, action) => {
        state.loadingBreakdown = false;
        state.loading = state.loadingOrder;
        state.dailyBreakdown = action.payload;
      })
      .addCase(fetchDailyDeliveryBreakdown.rejected, (state, action) => {
        state.loadingBreakdown = false;
        state.loading = state.loadingOrder;
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