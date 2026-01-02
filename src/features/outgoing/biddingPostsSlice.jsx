import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBiddingPostsApi } from "../../api/outgoing";

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

// Helper function to map API post to component format
const mapBiddingPostFromApi = (post) => {
    if (!post) return null;
    
    // Format integration
    const formatIntegration = (integration) => {
        if (!integration) return "N/A";
        if (typeof integration === 'object' && integration !== null) {
            return integration.description || integration.type || integration.name || String(integration.id || "N/A");
        }
        return String(integration);
    };
    
    // Map status to component format
    const mapStatus = (status) => {
        if (!status) return "N/A";
        const statusStr = String(status);
        // Map common status values
        if (statusStr.toLowerCase() === "paused") return "Paused";
        if (statusStr.toLowerCase() === "active") return "Active";
        if (statusStr.toLowerCase() === "unlimited") return "Active";
        if (statusStr.toLowerCase() === "archived") return "Archived";
        if (statusStr.toLowerCase() === "fulfilled") return "Fulfilled";
        return statusStr;
    };
    
    return {
        id: post.id || post.opid || post.platform_order_id || null,
        platform: post.Platform ? {
            id: post.Platform.id,
            name: post.Platform.platform_name || post.Platform.name || "N/A"
        } : (typeof post.platform === 'string' ? post.platform : "N/A"),
        created: post.created_date || formatDate(post.created_at || post.createdAt || post.created),
        integration: formatIntegration(post.integration || post.api_integration_id),
        posted: post.posted_count !== undefined && post.posted_count !== null ? post.posted_count : 0,
        postedToday: post.posted_today !== undefined && post.posted_today !== null ? post.posted_today : 0,
        orderCap: post.total_required !== undefined && post.total_required !== null ? String(post.total_required) : "Unlimited",
        dailyCap: post.PlatformOrder?.daily_cap !== undefined && post.PlatformOrder?.daily_cap !== null ? String(post.PlatformOrder.daily_cap) : "Unlimited",
        status: mapStatus(post.post_status || post.PlatformOrder?.post_status || "N/A"),
        platformOrderId: post.platform_order_id || post.PlatformOrder?.id || null,
    };
};

export const fetchBiddingPosts = createAsyncThunk(
    "biddingPosts/fetchBiddingPosts",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getBiddingPostsApi(params);
            // Handle response structure: { status: "success", data: { outgoing_posts: [...], pagination: {...} } }
            const posts = response?.data?.outgoing_posts || response?.outgoing_posts || [];
            const pagination = response?.data?.pagination || response?.pagination || null;
            
            // Map posts to component format
            const mappedPosts = posts.map(mapBiddingPostFromApi).filter(Boolean);
            
            return {
                posts: mappedPosts,
                pagination,
            };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch bidding posts");
        }
    }
);

const initialState = {
    posts: [],
    pagination: null,
    loading: false,
    error: null,
};

const biddingPostsSlice = createSlice({
    name: "biddingPosts",
    initialState,
    reducers: {
        clearPosts: (state) => {
            state.posts = [];
            state.pagination = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBiddingPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBiddingPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload.posts || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchBiddingPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearPosts } = biddingPostsSlice.actions;
export default biddingPostsSlice.reducer;
