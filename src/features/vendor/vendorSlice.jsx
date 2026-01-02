import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import { getVendorsApi, searchVendorsApi, getVendorByIdApi } from "../../api/vendors.js";

// Helper to transform vendor data from API to UI format
const transformVendor = (vendor) => {
    let enteredOn = "";
    const createdAt = vendor.created_at || vendor.createdAt || vendor.enteredOn || vendor.date_entered;

    if (createdAt) {
        try {
            const date = new Date(createdAt);
            if (!isNaN(date.getTime())) {
                enteredOn = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
            }
        } catch (e) {
            enteredOn = createdAt;
        }
    }

    // Normalize status to capitalized format (Active, Pending, Inactive)
    let status = "Inactive";
    if (vendor.is_active === true || vendor.status === "Active" || vendor.status === "active") {
        status = "Active";
    } else if (vendor.status === "Pending" || vendor.status === "pending") {
        status = "Pending";
    }

    return {
        ...vendor,
        id: vendor.id,
        name: vendor.vendor_name || vendor.name || vendor.vendorName || "-",
        company: vendor.company_name || vendor.company || "-",
        status: status,
        enteredOn: enteredOn || new Date().toLocaleDateString(),
        lists: vendor.lists || vendor.listsCount || 0,
        referrer: vendor.referrer || vendor.referrer_name || "N/A",
    };
};

// Async thunk to fetch vendors from API
export const fetchVendors = createAsyncThunk(
    "vendors/fetchVendors",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await getVendorsApi(page, limit);

            let vendorsData = [];
            let paginationData = null;

            if (Array.isArray(response)) {
                vendorsData = response;
            } else if (response?.data) {
                // Handle cases where data is an array or an object containing an array
                vendorsData = Array.isArray(response.data) ? response.data : (response.data.vendors || []);
                paginationData = response.pagination || response.data.pagination;
            } else if (response?.vendors) {
                vendorsData = response.vendors;
                paginationData = response.pagination;
            } else if (response?.data?.data) {
                vendorsData = Array.isArray(response.data.data) ? response.data.data : [];
                paginationData = response.data.pagination;
            }

            const transformedVendors = vendorsData.map(transformVendor);

            const pagination = paginationData ? {
                page: paginationData.currentPage || paginationData.page || page,
                limit: paginationData.itemsPerPage || paginationData.limit || limit,
                total: paginationData.totalItems || paginationData.total || transformedVendors.length,
                totalPages: paginationData.totalPages || 1,
            } : {
                page,
                limit,
                total: vendorsData.length,
                totalPages: 1
            };

            return { vendors: transformedVendors, pagination };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch vendors");
        }
    }
);

// Async thunk to search vendors with filters
export const searchVendors = createAsyncThunk(
    "vendors/searchVendors",
    async ({ search = "", page = 1, limit = 10, is_active = "", vendor_type = "", country = "" }, { rejectWithValue }) => {
        try {
            const response = await searchVendorsApi({ search, page, limit, is_active, vendor_type, country });

            let vendorsData = [];
            let paginationData = null;

            if (Array.isArray(response)) {
                vendorsData = response;
            } else if (response?.data) {
                vendorsData = Array.isArray(response.data) ? response.data : (response.data.vendors || []);
                paginationData = response.pagination || response.data.pagination;
            } else if (response?.vendors) {
                vendorsData = response.vendors;
                paginationData = response.pagination;
            }

            const transformedVendors = vendorsData.map(transformVendor);

            const pagination = {
                page: paginationData?.currentPage || paginationData?.page || page,
                limit: paginationData?.itemsPerPage || paginationData?.limit || limit,
                total: paginationData?.totalItems || paginationData?.total || response?.total || transformedVendors.length,
                totalPages: paginationData?.totalPages || response?.total_pages || Math.ceil((paginationData?.total || transformedVendors.length) / limit),
            };

            return { vendors: transformedVendors, pagination };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to search vendors");
        }
    }
);

// Async thunk to fetch a single vendor by ID
export const fetchVendorById = createAsyncThunk(
    "vendors/fetchVendorById",
    async (id, { rejectWithValue }) => {
        if (!id || id === 'undefined') {
            return rejectWithValue('Invalid vendor ID');
        }
        try {
            const response = await getVendorByIdApi(id);
            const vendorData = response?.data || response;
            return transformVendor(vendorData);
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch vendor details");
        }
    }
);

const initialState = {
    vendors: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
};

const vendorSlice = createSlice({
    name: "vendor",
    initialState,
    reducers: {
        // Add new vendor
        addVendor: (state, action) => {
            const newVendor = {
                id: nanoid(),
                enteredOn: new Date().toLocaleDateString("en-US"),
                status: "Active",
                lists: 0,
                ...action.payload,
            };
            state.vendors.push(newVendor);
        },

        // Remove vendor by id
        removeVendor: (state, action) => {
            state.vendors = state.vendors.filter(
                (vendor) => vendor.id !== action.payload
            );
        },

        // Update vendor details
        updateVendor: (state, action) => {
            const { id, data } = action.payload;
            const index = state.vendors.findIndex((v) => v.id === id);
            if (index !== -1) {
                state.vendors[index] = {
                    ...state.vendors[index],
                    ...data,
                };
            }
        },

        // Toggle Active/Inactive status
        toggleVendorStatus: (state, action) => {
            const id = action.payload;
            const vendor = state.vendors.find((v) => v.id === id);
            if (vendor) {
                vendor.status = vendor.status === "Active" ? "Inactive" : "Active";
            }
        },

        // Set vendors (for API data)
        setVendors: (state, action) => {
            state.vendors = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVendors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendors.fulfilled, (state, action) => {
                state.loading = false;
                // Handle both array response and object with vendors + pagination
                if (action.payload?.vendors) {
                    state.vendors = Array.isArray(action.payload.vendors) ? action.payload.vendors : [];
                    if (action.payload.pagination) {
                        state.pagination = action.payload.pagination;
                    }
                } else {
                    // Direct array response (backward compatibility)
                    state.vendors = Array.isArray(action.payload) ? action.payload : [];
                }
                state.error = null;
            })
            .addCase(fetchVendors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchVendors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchVendors.fulfilled, (state, action) => {
                state.loading = false;
                state.vendors = action.payload.vendors || action.payload || [];
                state.pagination = action.payload.pagination || state.pagination;
                state.error = null;
            })
            .addCase(searchVendors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchVendorById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorById.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.vendors.findIndex(v => String(v.id) === String(action.payload.id));
                if (index !== -1) {
                    state.vendors[index] = action.payload;
                } else {
                    state.vendors.push(action.payload);
                }
                state.error = null;
            })
            .addCase(fetchVendorById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Actions
export const { addVendor, removeVendor, updateVendor, toggleVendorStatus } =
    vendorSlice.actions;

// Selector to get vendor by ID
export const selectVendorById = (state, id) => {
    if (!id || id === 'undefined') return null;
    return state.vendors.vendors.find((v) => String(v.id) === String(id));
};

export default vendorSlice.reducer;