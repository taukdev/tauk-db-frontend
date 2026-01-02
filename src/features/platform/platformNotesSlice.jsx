import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPlatformNotesApi, createPlatformNoteApi } from "../../api/platforms";

export const fetchPlatformNotes = createAsyncThunk(
  "platformNotes/fetchNotes",
  async (platformId, { rejectWithValue }) => {
    try {
      const response = await getPlatformNotesApi(platformId);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch notes");
    }
  }
);

export const createPlatformNote = createAsyncThunk(
  "platformNotes/createNote",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await createPlatformNoteApi(id, payload);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create note");
    }
  }
);

const platformNotesSlice = createSlice({
  name: "platformNotes",
  initialState: {
    notes: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearNotes: (state) => {
      state.notes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchPlatformNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createPlatformNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      });
  },
});

export const { clearNotes } = platformNotesSlice.actions;
export const selectPlatformNotes = (state) => state.platformNotes.notes;
export default platformNotesSlice.reducer;
