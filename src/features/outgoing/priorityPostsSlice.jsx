import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPriorityPostsApi } from "../../api/outgoing";

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
const mapPostFromApi = (post) => {
    if (!post) return null;
    
    // Format integration (truncate if needed, similar to original format)
    const formatIntegration = (integration) => {
        if (!integration || integration === "N/A") return "N/A";
        const integrationStr = String(integration);
        return integrationStr.length > 15 ? integrationStr.substring(0, 15) + "..." : integrationStr;
    };
    
    // Map status to component format
    const mapStatus = (status) => {
        if (!status) return "N/A";
        const statusStr = String(status);
        // Map common status values
        if (statusStr.toLowerCase() === "paused") return "Paused";
        if (statusStr.toLowerCase() === "active") return "Active";
        if (statusStr.toLowerCase() === "unlimited") return "Active";
        return statusStr;
    };
    
    return {
        id: post.id || post.opid || post.platform_order_id || null,
        platform: post.Platform?.platform_name || post.Platform?.name || "N/A",
        platformId: post.Platform?.id || post.platform_id || null,
        created: post.created_date || formatDate(post.created_at || post.createdAt || post.created) || "N/A",
        integration: formatIntegration(post.integration || post.api_integration_id || post.description || "N/A"),
        posted: post.posted_count !== undefined && post.posted_count !== null ? post.posted_count : 0,
        postedToday: post.posted_today !== undefined && post.posted_today !== null ? post.posted_today : 0,
        orderCap: post.total_required !== undefined && post.total_required !== null ? String(post.total_required) : "Unlimited",
        dailyCap: post.PlatformOrder?.daily_cap !== undefined && post.PlatformOrder?.daily_cap !== null ? String(post.PlatformOrder.daily_cap) : "Unlimited",
        status: mapStatus(post.post_status || post.PlatformOrder?.post_status || "N/A"),
    };
};

// Transform API response to component structure
const transformApiResponse = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map((order) => {
        const sectionId = order.order_id || order.order_name || "N/A";
        const sectionTitle = `${order.order_id || ""} - ${order.order_name || order.order_id || "N/A"}`;
        
        // Transform positions object to array
        const positions = [];
        if (order.positions && typeof order.positions === 'object') {
            const positionKeys = Object.keys(order.positions).sort((a, b) => {
                // Sort position keys numerically
                const aNum = parseInt(a, 10);
                const bNum = parseInt(b, 10);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.localeCompare(b);
            });
            
            positionKeys.forEach((positionKey, index) => {
                const posts = order.positions[positionKey];
                if (Array.isArray(posts)) {
                    positions.push({
                        positionId: `Position ${positionKey}`,
                        isExpanded: index === 0, // First position (Position 1) is expanded by default
                        data: posts.map(mapPostFromApi).filter(Boolean),
                    });
                }
            });
        }
        
        return {
            sectionId,
            sectionTitle,
            positions,
        };
    });
};

// Async thunk to fetch priority posts
export const fetchPriorityPosts = createAsyncThunk(
    "priorityPosts/fetchPriorityPosts",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await getPriorityPostsApi(params);
            // Handle response structure: { status: "success", data: [...] }
            const apiData = response?.data || response || [];
            return transformApiResponse(apiData);
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch priority posts");
        }
    }
);

// Default state populated with the page's sample data
const initialState = {
  sections: [
    {
      sectionId: "5527",
      sectionTitle: "5527 - 5527 NEW Mounja Burn Abandons (F&G) Onsite",
      positions: [
        {
          positionId: "Position 1",
          isExpanded: true,
          data: [
            {
              id: 23086,
              platform: "MBC CDC",
              created: "01/03/2025",
              integration: "NewMounjaBur...",
              posted: 11893,
              postedToday: 0,
              orderCap: "Unlimited",
              dailyCap: "Unlimited",
              status: "Active",
            },
            {
              id: 23087,
              platform: "Chase Data Corp",
              created: "01/03/2025",
              integration: "NewMounjaBur...",
              posted: 18825,
              postedToday: 0,
              orderCap: "Unlimited",
              dailyCap: "Unlimited",
              status: "Active",
            },
          ],
        },
        {
          positionId: "Position 2",
          isExpanded: false,
          data: [
            {
              id: 23086,
              platform: "MBC CDC",
              created: "01/03/2025",
              integration: "NewMounjaBur...",
              posted: 11893,
              postedToday: 0,
              orderCap: "Unlimited",
              dailyCap: "Unlimited",
              status: "Active",
            },
          ],
        },
      ],
    },
    {
      sectionId: "5528",
      sectionTitle: "5528 - NEW Mounja Burn Buyers (F&G) Onsite",
      positions: [
        {
          positionId: "Position 1",
          isExpanded: false,
          data: [
            {
              id: 23086,
              platform: "MBC CDC",
              created: "01/03/2025",
              integration: "NewMounjaBur...",
              posted: 11893,
              postedToday: 0,
              orderCap: "Unlimited",
              dailyCap: "Unlimited",
              status: "Active",
            },
            {
              id: 23086,
              platform: "MBC CDC",
              created: "01/03/2025",
              integration: "NewMounjaBur...",
              posted: 11893,
              postedToday: 0,
              orderCap: "Unlimited",
              dailyCap: "Unlimited",
              status: "Active",
            },
            {
              id: 23086,
              platform: "MBC CDC",
              created: "01/03/2025",
              integration: "NewMounjaBur...",
              posted: 11893,
              postedToday: 0,
              orderCap: "Unlimited",
              dailyCap: "Unlimited",
              status: "Active",
            },
          ],
        },
      ],
    },
  ],
};

const priorityPostsSlice = createSlice({
    name: "priorityPosts",
    initialState: {
        sections: [],
        loading: false,
        error: null,
    },
    reducers: {
        setPrioritySections: (state, action) => {
            state.sections = action.payload || [];
        },
        clearPrioritySections: (state) => {
            state.sections = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPriorityPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPriorityPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.sections = action.payload || [];
            })
            .addCase(fetchPriorityPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setPrioritySections, clearPrioritySections } = priorityPostsSlice.actions;

export default priorityPostsSlice.reducer;