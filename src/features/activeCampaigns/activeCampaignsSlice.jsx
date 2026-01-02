import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getActiveCampaignsApi,
    getCampaignsDropdownApi,
    getTeamsApi,
    createTeamApi,
    updateTeamApi,
    deleteTeamApi,
    createActiveCampaignApi,
    getActiveCampaignByIdApi,
    updateActiveCampaignApi,
    deleteActiveCampaignApi,
    getVendorsForActiveCampaignApi,
    createVendorForActiveCampaignApi,
    updateVendorForActiveCampaignApi,
    deleteVendorForActiveCampaignApi
} from "../../api/activeCampaigns";

// Async thunk to fetch active campaigns
export const fetchActiveCampaigns = createAsyncThunk(
    "activeCampaigns/fetchActiveCampaigns",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await getActiveCampaignsApi(page, limit);

            let campaignsData = [];
            let paginationData = null;

            if (Array.isArray(response)) {
                campaignsData = response;
            } else if (response?.data?.campaigns) {
                campaignsData = response.data.campaigns;
                paginationData = response.data.pagination;
            } else if (response?.data) {
                campaignsData = Array.isArray(response.data) ? response.data : (response.data.campaigns || []);
                paginationData = response.pagination || response.data.pagination;
            } else if (response?.campaigns) {
                campaignsData = response.campaigns;
                paginationData = response.pagination;
            }

            // Normalizing campaign data to handle the new Vendor and Team objects
            const normalizedCampaigns = campaignsData.map(c => ({
                ...c,
                id: c.id || c._id,
                // If list_ids is present, use the first as listId and the rest as campaignNames
                listId: Array.isArray(c.list_ids) ? c.list_ids[0] : (typeof c.listId === 'object' ? (c.listId.campaign || c.listId.list_id || c.listId.listId || "") : c.listId),
                campaignNames: Array.isArray(c.list_ids) ? c.list_ids.slice(1) : (c.campaignNames || []).map(n =>
                    typeof n === 'object' ? (n.campaign || n.list_id || n.listId || "") : n
                ),
                vendorId: c.Vendor?.id || c.vendorId,
                vendorName: c.Vendor?.vendor_name || c.vendorName,
                teamId: c.Team?.id || c.team_id || c.teamId,
                assignedTeam: c.Team?.team_name || (typeof c.assignedTeam === 'object' ? (c.assignedTeam.team_name || c.assignedTeam.name || "") : c.assignedTeam),
            }));

            // Normalizing pagination format
            const pagination = paginationData ? {
                page: paginationData.currentPage || paginationData.page || page,
                limit: paginationData.itemsPerPage || paginationData.limit || limit,
                total: paginationData.totalItems || paginationData.total || normalizedCampaigns.length,
                totalPages: paginationData.totalPages || 1,
            } : {
                page,
                limit,
                total: normalizedCampaigns.length,
                totalPages: 1
            };

            return { campaigns: normalizedCampaigns, pagination };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch active campaigns");
        }
    }
);

// New Async Thunk for creating active campaign
export const createActiveCampaign = createAsyncThunk(
    "activeCampaigns/createActiveCampaign",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await createActiveCampaignApi(payload);
            return response?.data || response;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create active campaign");
        }
    }
);

export const fetchActiveCampaignById = createAsyncThunk(
    "activeCampaigns/fetchActiveCampaignById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await getActiveCampaignByIdApi(id);
            const data = response?.data || response;
            // Normalize the single campaign data similar to fetchActiveCampaigns
            const c = data;
            return {
                ...c,
                id: c.id || c._id,
                listId: Array.isArray(c.list_ids) ? c.list_ids[0] : (typeof c.listId === 'object' ? (c.listId.campaign || c.listId.list_id || c.listId.listId || "") : c.listId),
                campaignNames: Array.isArray(c.list_ids) ? c.list_ids.slice(1) : (c.campaignNames || []).map(n =>
                    typeof n === 'object' ? (n.campaign || n.list_id || n.listId || "") : n
                ),
                vendorId: c.Vendor?.id || c.vendorId,
                vendorName: c.Vendor?.vendor_name || c.vendorName,
                teamId: c.Team?.id || c.team_id || c.teamId,
                assignedTeam: c.Team?.team_name || (typeof c.assignedTeam === 'object' ? (c.assignedTeam.team_name || c.assignedTeam.name || "") : c.assignedTeam),
            };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch active campaign by ID");
        }
    }
);

export const updateActiveCampaign = createAsyncThunk(
    "activeCampaigns/updateActiveCampaign",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const response = await updateActiveCampaignApi(id, payload);
            return response?.data || response;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update active campaign");
        }
    }
);

export const deleteActiveCampaign = createAsyncThunk(
    "activeCampaigns/deleteActiveCampaign",
    async (id, { rejectWithValue }) => {
        try {
            await deleteActiveCampaignApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete active campaign");
        }
    }
);


// New Async Thunks
export const fetchCampaignsDropdown = createAsyncThunk(
    "activeCampaigns/fetchCampaignsDropdown",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCampaignsDropdownApi();
            const data = response?.data || response;
            if (Array.isArray(data)) {
                return data.map(item =>
                    typeof item === 'object' ? (item.campaign || item.list_id || item.listId || "") : item
                );
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch campaigns dropdown");
        }
    }
);

export const fetchTeams = createAsyncThunk(
    "activeCampaigns/fetchTeams",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getTeamsApi();
            const data = response?.data || response;
            // We want to keep teams as objects for CRUD in the dropdown, 
            // but ensure they have standard properties.
            if (Array.isArray(data)) {
                return data.map(team => ({
                    id: team.id || team._id,
                    team_name: team.team_name || team.name || (typeof team === 'string' ? team : ""),
                }));
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch teams");
        }
    }
);

export const createTeam = createAsyncThunk(
    "activeCampaigns/createTeam",
    async (teamName, { rejectWithValue }) => {
        try {
            const response = await createTeamApi(teamName);
            const data = response?.data || response;
            // Normalize response to {id, team_name}
            return {
                id: data.id || data._id,
                team_name: data.team_name || data.name || teamName,
            };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create team");
        }
    }
);

export const updateTeam = createAsyncThunk(
    "activeCampaigns/updateTeam",
    async ({ id, teamName }, { rejectWithValue }) => {
        try {
            const response = await updateTeamApi(id, teamName);
            const data = response?.data || response;
            // Normalize response to {id, team_name}
            return {
                id: data.id || data._id || id,
                team_name: data.team_name || data.name || teamName,
            };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update team");
        }
    }
);

export const deleteTeam = createAsyncThunk(
    "activeCampaigns/deleteTeam",
    async (id, { rejectWithValue }) => {
        try {
            await deleteTeamApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete team");
        }
    }
);

// Vendor for Active Campaign Thunks
export const fetchActiveCampaignVendors = createAsyncThunk(
    "activeCampaigns/fetchActiveCampaignVendors",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getVendorsForActiveCampaignApi();
            const data = response?.data || response;
            if (Array.isArray(data)) {
                return data.map(v => ({
                    id: v.id || v._id,
                    vendor_name: v.vendor_name || v.name || "",
                }));
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch vendors");
        }
    }
);

export const createActiveCampaignVendor = createAsyncThunk(
    "activeCampaigns/createActiveCampaignVendor",
    async (vendorName, { rejectWithValue }) => {
        try {
            const response = await createVendorForActiveCampaignApi(vendorName);
            const data = response?.data || response;
            return {
                id: data.id || data._id,
                vendor_name: data.vendor_name || data.name || vendorName,
            };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create vendor");
        }
    }
);

export const updateActiveCampaignVendor = createAsyncThunk(
    "activeCampaigns/updateActiveCampaignVendor",
    async ({ id, vendorName }, { rejectWithValue }) => {
        try {
            const response = await updateVendorForActiveCampaignApi(id, vendorName);
            const data = response?.data || response;
            return {
                id: data.id || data._id || id,
                vendor_name: data.vendor_name || data.name || vendorName,
            };
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update vendor");
        }
    }
);

export const deleteActiveCampaignVendor = createAsyncThunk(
    "activeCampaigns/deleteActiveCampaignVendor",
    async (id, { rejectWithValue }) => {
        try {
            await deleteVendorForActiveCampaignApi(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete vendor");
        }
    }
);

const initialState = {
    campaigns: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    dropdowns: {
        listIds: [],
        teams: [],
        vendors: [],
        loading: false,
        error: null,
    }
};

const activeCampaignsSlice = createSlice({
    name: "activeCampaigns",
    initialState,
    reducers: {
        setCampaigns: (state, action) => {
            state.campaigns = action.payload;
        },
        addCampaign: (state, action) => {
            state.campaigns.push(action.payload);
        },
        updateCampaign: (state, action) => {
            const index = state.campaigns.findIndex((campaign) => campaign.id === action.payload.id);
            if (index !== -1) {
                state.campaigns[index] = action.payload;
            }
        },
        deleteCampaign: (state, action) => {
            state.campaigns = state.campaigns.filter((campaign) => campaign.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // Active Campaigns
            .addCase(fetchActiveCampaigns.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveCampaigns.fulfilled, (state, action) => {
                state.loading = false;
                state.campaigns = action.payload.campaigns || [];
                state.pagination = action.payload.pagination || state.pagination;
                state.error = null;
            })
            .addCase(fetchActiveCampaigns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Active Campaign
            .addCase(createActiveCampaign.pending, (state) => {
                state.loading = true;
            })
            .addCase(createActiveCampaign.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally add to list if not refetching
                // state.campaigns.unshift(action.payload);
            })
            .addCase(createActiveCampaign.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Active Campaign
            .addCase(updateActiveCampaign.fulfilled, (state, action) => {
                const updated = action.payload;
                // Normalize if necessary (using similar logic as fetchAll)
                const c = updated;
                const normalized = {
                    ...c,
                    id: c.id || c._id,
                    listId: Array.isArray(c.list_ids) ? c.list_ids[0] : (c.listId || ""),
                    campaignNames: Array.isArray(c.list_ids) ? c.list_ids.slice(1) : (c.campaignNames || []),
                    vendorId: c.Vendor?.id || c.vendorId,
                    vendorName: c.Vendor?.vendor_name || c.vendorName,
                    teamId: c.Team?.id || c.team_id || c.teamId,
                    assignedTeam: c.Team?.team_name || (typeof c.assignedTeam === 'object' ? (c.assignedTeam.team_name || c.assignedTeam.name || "") : c.assignedTeam),
                };
                const index = state.campaigns.findIndex(camp => camp.id === normalized.id);
                if (index !== -1) {
                    state.campaigns[index] = normalized;
                }
            })
            // Delete Active Campaign
            .addCase(deleteActiveCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
            })
            // Campaigns Dropdown
            .addCase(fetchCampaignsDropdown.fulfilled, (state, action) => {
                state.dropdowns.listIds = action.payload;
            })
            // Teams
            .addCase(fetchTeams.pending, (state) => {
                state.dropdowns.loading = true;
            })
            .addCase(fetchTeams.fulfilled, (state, action) => {
                state.dropdowns.teams = action.payload;
                state.dropdowns.loading = false;
            })
            .addCase(fetchTeams.rejected, (state, action) => {
                state.dropdowns.loading = false;
                state.dropdowns.error = action.payload;
            })
            .addCase(createTeam.fulfilled, (state, action) => {
                state.dropdowns.teams.push(action.payload);
            })
            .addCase(updateTeam.fulfilled, (state, action) => {
                const index = state.dropdowns.teams.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.dropdowns.teams[index] = action.payload;
                }
            })
            .addCase(deleteTeam.fulfilled, (state, action) => {
                state.dropdowns.teams = state.dropdowns.teams.filter(t => t.id !== action.payload);
            })
            // Vendor for Active Campaign
            .addCase(fetchActiveCampaignVendors.fulfilled, (state, action) => {
                state.dropdowns.vendors = action.payload;
            })
            .addCase(createActiveCampaignVendor.fulfilled, (state, action) => {
                state.dropdowns.vendors.push(action.payload);
            })
            .addCase(updateActiveCampaignVendor.fulfilled, (state, action) => {
                const index = state.dropdowns.vendors.findIndex(v => v.id === action.payload.id);
                if (index !== -1) {
                    state.dropdowns.vendors[index] = action.payload;
                }
            })
            .addCase(deleteActiveCampaignVendor.fulfilled, (state, action) => {
                state.dropdowns.vendors = state.dropdowns.vendors.filter(v => v.id !== action.payload);
            });
    },
});

export const { setCampaigns, addCampaign, updateCampaign, deleteCampaign } = activeCampaignsSlice.actions;

export default activeCampaignsSlice.reducer;