import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Simulate async fetch - in real app, replace with API call
export const fetchSendReports = createAsyncThunk(
  'sendReport/fetch',
  async (_, thunkAPI) => {
    // For now return mock data
    const mock = Array.from({ length: 52 }, (_, i) => ({
      id: i + 1,
      report: `Example Report ${i + 1}`,
      recipient: [`user${i + 1}@example.com`].join(','),
      scheduleType: i % 2 === 0 ? 'Frequency' : 'Schedule',
    }));
    return new Promise((res) => setTimeout(() => res(mock), 200));
  }
);

const sendReportSlice = createSlice({
  name: 'sendReport',
  initialState: {
    items: [],
    loading: false,
    error: null,
    search: '',
    page: 1,
    perPage: 10,
    selected: [],
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    setPerPage(state, action) {
      state.perPage = action.payload;
      state.page = 1;
    },
    toggleSelect(state, action) {
      const id = action.payload;
      if (state.selected.includes(id)) {
        state.selected = state.selected.filter((x) => x !== id);
      } else {
        state.selected.push(id);
      }
    },
    clearSelected(state) {
      state.selected = [];
    },
    setShowPanel(state, action) {
      state.showPanel = action.payload;
    },
    toggleFilter(state) {
      state.filterOpen = !state.filterOpen;
    },
    toggleSelectAllOnPage: (state, action) => {
      state.selected = action.payload; // either all IDs or []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSendReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSendReports.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSendReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setSearch, setPage, setPerPage, toggleSelect, clearSelected, toggleSelectAllOnPage, setShowPanel, toggleFilter } = sendReportSlice.actions;
export default sendReportSlice.reducer;
