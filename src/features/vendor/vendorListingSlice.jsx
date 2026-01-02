import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getVendorListByIdApi, updateListApi, activateListApi, deactivateListApi } from '../../api/vendors.js';

export const updateList = createAsyncThunk(
    'vendorListing/updateList',
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const response = await updateListApi(id, payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update list');
        }
    }
);

export const activateList = createAsyncThunk(
    'vendorListing/activateList',
    async (id, { rejectWithValue }) => {
        try {
            const response = await activateListApi(id);
            return { id, is_active: true };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to activate list');
        }
    }
);

export const deactivateList = createAsyncThunk(
    'vendorListing/deactivateList',
    async (id, { rejectWithValue }) => {
        try {
            const response = await deactivateListApi(id);
            return { id, is_active: false };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to deactivate list');
        }
    }
);

export const fetchListById = createAsyncThunk(
    'vendorListing/fetchListById',
    async (id, { rejectWithValue }) => {
        if (!id || id === 'undefined') {
            return rejectWithValue('Invalid list ID');
        }
        try {
            const response = await getVendorListByIdApi(id);
            const data = response.data;

            // Map API response to UI field names
            return {
                id: data.id,
                vendor_id: data.vendor_id || data.vendorId || data.created_by || data.createdBy,
                listName: data.list_name || '',
                dateEntered: data.date_entered || '',
                costPerLead: data.fixed_cost_per_lead || '0.00',
                listVertical: data.list_vertical || '',
                ownerReshare: data.owner_revshare_percent || '0.00',
                howToSell: data.how_to_sell === 'basic_rules' ? 'basic' : 'advanced',
                sellTimes: data.sell_times || '4',
                salesRep: data.sales_rep || '',
                referrer: data.referrer || '',
                listStatus: data.list_status || 'active',
                suppressionScrub: data.suppression_scrub ?? false,
                level1EmailScrub: data.level_1_email_scrub ?? false,
                level2EmailScrub: data.level_2_email_scrub ?? true,
                level2PhoneScrub: data.level_2_phone_scrub ?? false,
                level3EmailScrub: data.level_3_email_scrub ?? false,
                tcpaScrub: data.tcpa_scrub ?? true,
                usAddressValidation: data.us_address_validation ?? false,
                validateIpAddress: data.validate_ip_address ?? false,
                geoComplete: data.geo_complete ?? false,
                blockBadWords: data.block_bad_words ?? false,
                genderComplete: data.gender_complete ?? false,
                appendMissingFields: data.append_missing_fields ?? false,
                listflexAppendService: data.listflex_append_service ?? false,
                dedupeAgainst: data.dedupe_against || 'entire_database',
                dedupeBack: data.dedupe_back || 2,
                requiredFields: data.required_fields || [],
                allowedCountries: data.allowed_countries || [],
                listType: data.list_type || 'priority_order',
                redirectAfterImport: data.redirect_after_import ?? false,
                apiConfig: data.api_config ? {
                    id: data.api_config.id,
                    apiUrl: data.api_config.api_url,
                    apiAuthToken: data.api_config.api_auth_token,
                    apiPayloadStructure: data.api_config.api_payload_structure,
                } : null,
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch list details');
        }
    }
);

const initialState = {
    activeLists: [],
    archivedLists: [],
    currentList: null,
    loading: false,
    error: null,
};

const vendorListingSlice = createSlice({
    name: 'vendorListing',
    initialState,
    reducers: {
        setCurrentList: (state, action) => {
            state.currentList = action.payload;
        },
        clearCurrentList: (state) => {
            state.currentList = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchListById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchListById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentList = action.payload;
            })
            .addCase(fetchListById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateList.fulfilled, (state, action) => {
                state.loading = false;
                state.currentList = { ...state.currentList, ...action.payload };
            })
            .addCase(updateList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(activateList.fulfilled, (state, action) => {
                if (state.currentList && String(state.currentList.id) === String(action.payload.id)) {
                    state.currentList.listStatus = 'active';
                }
            })
            .addCase(deactivateList.fulfilled, (state, action) => {
                if (state.currentList && String(state.currentList.id) === String(action.payload.id)) {
                    state.currentList.listStatus = 'archived';
                }
            });
    },
});

export const { setCurrentList, clearCurrentList } = vendorListingSlice.actions;

// Selector to get data by id
export const selectListById = (state, id) => {
    // Check currentList first
    if (state.vendorListing.currentList && String(state.vendorListing.currentList.id) === String(id)) {
        return state.vendorListing.currentList;
    }

    const activeListItem = state.vendorListing.activeLists.find(item => String(item.id) === String(id));
    if (activeListItem) {
        return activeListItem;
    }

    const archivedListItem = state.vendorListing.archivedLists.find(item => String(item.id) === String(id));
    return archivedListItem || null;
};

export default vendorListingSlice.reducer;
