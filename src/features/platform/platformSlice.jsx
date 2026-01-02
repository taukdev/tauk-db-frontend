import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPlatformsApi,
  createPlatformApi,
  getLeadReturnCutoffsApi,
  getCountriesApi,
  getStatesByCountryApi,
  getPaymentTermsApi,
  getPlatformTypesApi
} from "../../api/platforms";

export const fetchPlatforms = createAsyncThunk(
  "platform/fetchPlatforms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPlatformsApi();
      return response?.data?.platforms || response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch platforms");
    }
  }
);

export const createPlatform = createAsyncThunk(
  "platform/createPlatform",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createPlatformApi(payload);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create platform");
    }
  }
);

export const fetchPlatformDropdowns = createAsyncThunk(
  "platform/fetchPlatformDropdowns",
  async (_, { rejectWithValue }) => {
    try {
      const [types, terms, countries, cutoffs] = await Promise.all([
        getPlatformTypesApi(),
        getPaymentTermsApi(),
        getCountriesApi(),
        getLeadReturnCutoffsApi()
      ]);

      return {
        types: types?.data || types,
        terms: terms?.data || terms,
        countries: countries?.data || countries,
        cutoffs: cutoffs?.data || cutoffs
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch dropdowns");
    }
  }
);

export const fetchStatesByCountry = createAsyncThunk(
  "platform/fetchStatesByCountry",
  async (countryId, { rejectWithValue }) => {
    try {
      const response = await getStatesByCountryApi(countryId);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch states");
    }
  }
);

const initialState = {
  platforms: [],
  loading: false,
  error: null,
  dropdowns: {
    types: [],
    terms: [],
    countries: [],
    states: [],
    cutoffs: [],
    loading: false,
    error: null
  }
};

const platformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Platforms
      .addCase(fetchPlatforms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.loading = false;
        state.platforms = action.payload;
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Platform
      .addCase(createPlatform.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPlatform.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createPlatform.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Dropdowns
      .addCase(fetchPlatformDropdowns.pending, (state) => {
        state.dropdowns.loading = true;
      })
      .addCase(fetchPlatformDropdowns.fulfilled, (state, action) => {
        state.dropdowns.loading = false;
        state.dropdowns.types = action.payload.types;
        state.dropdowns.terms = action.payload.terms;
        state.dropdowns.countries = action.payload.countries;
        state.dropdowns.cutoffs = action.payload.cutoffs;
      })
      .addCase(fetchPlatformDropdowns.rejected, (state, action) => {
        state.dropdowns.loading = false;
        state.dropdowns.error = action.payload;
      })
      // States
      .addCase(fetchStatesByCountry.fulfilled, (state, action) => {
        state.dropdowns.states = action.payload;
      });
  }
});


export const selectPlatformById = (state, id) =>
  state.platform.platforms.find((p) => String(p.id) === String(id));

export default platformSlice.reducer;
