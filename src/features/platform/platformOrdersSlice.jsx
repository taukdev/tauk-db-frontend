import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPlatformOrdersApi,
  createPlatformOrderApi,
} from "../../api/platforms";

// Helper function to map API response (snake_case) to component format (camelCase)
const mapOrderFromApi = (order) => {
  if (!order || typeof order !== 'object') {
    console.warn("Invalid order data:", order);
    return null;
  }

  try {
    return {
      id: order.id || order.order_id || null,
      timeEntered:
        order.time_entered ||
        order.timeEntered ||
        order.created_at ||
        order.date_entered ||
        order.entered_on ||
        "N/A",
      // Properly handle 0 values for leads_delivered
      leadsDelivered: order.leads_delivered !== undefined && order.leads_delivered !== null
        ? order.leads_delivered
        : (order.leadsDelivered !== undefined && order.leadsDelivered !== null
          ? order.leadsDelivered
          : 0),
      orderType: order.order_type || order.orderType || order.order_kind || "N/A",
      postStatus: order.post_status || order.postStatus || "N/A",
      // Include any other fields that might be needed
      ...order,
    };
  } catch (error) {
    console.error("Error mapping order:", error, order);
    return null;
  }
};

export const fetchPlatformOrders = createAsyncThunk(
  "platformOrders/fetchOrders",
  async (platformId, { rejectWithValue }) => {
    try {
      if (!platformId) {
        throw new Error("Platform ID is required");
      }

      const response = await getPlatformOrdersApi(platformId);
      
      // Handle different response structures
      // Expected: { status: "success", data: [...], pagination: {...} }
      // Or: { data: [...] }
      // Or: [...] (direct array)
      let orders = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        orders = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // { data: [...] } or { status: "success", data: [...] }
        orders = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Nested structure: { data: { data: [...] } }
        orders = response.data.data;
      } else {
        // If no orders found, return empty array (not an error)
        console.warn("Unexpected response structure for platform orders:", response);
        orders = [];
      }

      // Validate that we have an array before mapping
      if (!Array.isArray(orders)) {
        console.error("Orders is not an array:", orders);
        return [];
      }

      // Map orders from API format to component format
      const mappedOrders = orders.map(mapOrderFromApi).filter(order => order !== null && order !== undefined);

      return mappedOrders;
    } catch (error) {
      console.error("Error fetching platform orders:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to fetch platform orders";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createPlatformOrder = createAsyncThunk(
  "platformOrders/createOrder",
  async ({ platformId, payload }, { rejectWithValue }) => {
    try {
      const response = await createPlatformOrderApi(platformId, payload);
      return response?.data || response;
    } catch (error) {
      // Extract error message and data for better error handling
      const errorMessage = error.message || "Failed to create platform order";
      const errorData = error.data || error.response?.data;
      return rejectWithValue({ message: errorMessage, data: errorData });
    }
  }
);

const initialState = {
  orders: [],
  loading: false,
  creating: false,
  error: null,
};

const platformOrdersSlice = createSlice({
  name: "platformOrders",
  initialState,
  reducers: {
    addOrder: (state, action) => {
      state.orders.push(action.payload);
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    removeOrder: (state, action) => {
      state.orders = state.orders.filter(
        (order) => order.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchPlatformOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPlatformOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPlatformOrder.fulfilled, (state, action) => {
        state.creating = false;
        // Don't add to state here - we'll refresh the list instead
        // This ensures we have the latest data from the server
      })
      .addCase(createPlatformOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      });
  },
});

export const { addOrder, updateOrder, removeOrder } =
  platformOrdersSlice.actions;
export default platformOrdersSlice.reducer;
