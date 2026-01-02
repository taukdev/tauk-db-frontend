import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOutgoingPostsApi } from "../../api/outgoing";

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        // Format as MM/DD/YYYY
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    } catch (e) {
        return dateString;
    }
};

// Helper function to map API response to component format
const mapOutgoingPostFromApi = (post) => {
    if (!post) return null;
    
    return {
        id: post.id || post.opid || null,
        opid: post.opid || null,
        platform: post.Platform ? {
            id: post.Platform.id,
            name: post.Platform.platform_name || post.Platform.name || "N/A"
        } : (typeof post.platform === 'string' ? post.platform : "N/A"),
        created: formatDate(post.created_at || post.createdAt || post.created),
        posted: post.posted_count !== undefined && post.posted_count !== null ? post.posted_count : (post.posted || 0),
        postedToday: post.posted_today !== undefined && post.posted_today !== null ? post.posted_today : (post.postedToday || 0),
        orderCap: post.total_required !== undefined && post.total_required !== null ? post.total_required : (post.orderCap || "Unlimited"),
        dailyCap: post.PlatformOrder?.daily_cap !== undefined && post.PlatformOrder?.daily_cap !== null ? post.PlatformOrder.daily_cap : (post.dailyCap || "N/A"),
        status: post.post_status || post.status || post.PlatformOrder?.post_status || "N/A",
        platformOrderId: post.platform_order_id || post.PlatformOrder?.id || null,
        listIds: post.list_ids || [],
        // Include all original fields for reference
        ...post,
        // Override integration AFTER spread to ensure it's always a string, not an object
        integration: (() => {
            const integration = post.integration;
            if (integration) {
                if (typeof integration === 'object' && integration !== null) {
                    return integration.description || integration.type || integration.name || String(integration.id || "N/A");
                }
                return String(integration);
            }
            return post.api_integration_id ? String(post.api_integration_id) : "N/A";
        })(),
    };
};

// Async thunk for fetching outgoing posts
export const fetchImportedData = createAsyncThunk(
    "importedData/fetchImportedData",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getOutgoingPostsApi(params);
            
            // Handle response structure: { status: "success", data: { outgoing_posts: [...], pagination: {...} } }
            let outgoingPosts = [];
            let paginationData = null;
            
            if (response?.data?.outgoing_posts && Array.isArray(response.data.outgoing_posts)) {
                // Expected structure: { status: "success", data: { outgoing_posts: [...], pagination: {...} } }
                outgoingPosts = response.data.outgoing_posts;
                paginationData = response.data.pagination || null;
            } else if (response?.outgoing_posts && Array.isArray(response.outgoing_posts)) {
                // Alternative: { outgoing_posts: [...], pagination: {...} }
                outgoingPosts = response.outgoing_posts;
                paginationData = response.pagination || null;
            } else if (Array.isArray(response?.data)) {
                // Direct array in data: { data: [...] }
                outgoingPosts = response.data;
                paginationData = response.pagination || null;
            } else if (Array.isArray(response)) {
                // Direct array
                outgoingPosts = response;
            }
            
            // Map posts from API format to component format
            const mappedPosts = outgoingPosts.map(mapOutgoingPostFromApi).filter(post => post !== null);
            
            return {
                posts: mappedPosts,
                pagination: paginationData,
            };
        } catch (error) {
            console.error("Error fetching imported data:", error);
            return rejectWithValue(error.message || "Failed to fetch outgoing posts");
        }
    }
);

// Default state
const initialState = {
    rows: [],
    loading: false,
    error: null,
    pagination: null,
};


const importedDataSlice = createSlice({
    name: "importedData",
    initialState,
    reducers: {
        setImportedRows: (state, action) => {
            state.rows = action.payload || [];
        },
        clearImportedRows: (state) => {
            state.rows = [];
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchImportedData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchImportedData.fulfilled, (state, action) => {
                state.loading = false;
                // Handle response structure: { posts: [...], pagination: {...} }
                if (action.payload?.posts && Array.isArray(action.payload.posts)) {
                    state.rows = action.payload.posts;
                    state.pagination = action.payload.pagination || null;
                } else if (Array.isArray(action.payload)) {
                    // Fallback: direct array
                    state.rows = action.payload;
                    state.pagination = null;
                } else {
                    state.rows = [];
                    state.pagination = null;
                }
            })
            .addCase(fetchImportedData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch outgoing posts";
            });
    },
});

export const { setImportedRows, clearImportedRows } = importedDataSlice.actions;

export default importedDataSlice.reducer;