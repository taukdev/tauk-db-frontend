// src/slices/activeListsSlice.js

import { createSlice } from "@reduxjs/toolkit";

// Sample data for active lists
const initialState = {
    lists: [
        {
            id: 4024,
            name: "4024 Striction D Partials",
            totalLeadCount: 124821,
            importStats: { imported: 150, failed: 12, skipped: 7 },
            vendorName: "Healthy Habits",
        },
        {
            id: 4025,
            name: "4025 Striction D Buyers",
            totalLeadCount: 26802,
            importStats: { imported: 320, failed: 8, skipped: 4 },
            vendorName: "Wellness World",
        },
        {
            id: 4026,
            name: "4026 Striction D Declines",
            totalLeadCount: 21168,
            importStats: { imported: 210, failed: 15, skipped: 6 },
            vendorName: "Health First",
        },
        {
            id: 4027,
            name: "4027 Striction BP Partials",
            totalLeadCount: 74953,
            importStats: { imported: 430, failed: 20, skipped: 12 },
            vendorName: "FitLife Co.",
        },
        {
            id: 4028,
            name: "4028 Striction BP Buyers",
            totalLeadCount: 18909,
            importStats: { imported: 120, failed: 5, skipped: 3 },
            vendorName: "Vitality Labs",
        },
        {
            id: 4029,
            name: "4029 Keto Plus Leads",
            totalLeadCount: 65432,
            importStats: { imported: 540, failed: 18, skipped: 9 },
            vendorName: "Keto Nation",
        },
        {
            id: 4030,
            name: "4030 Omega 3 Partials",
            totalLeadCount: 48321,
            importStats: { imported: 390, failed: 22, skipped: 11 },
            vendorName: "NutriMax",
        },
        {
            id: 4031,
            name: "4031 Vitamin C Buyers",
            totalLeadCount: 37520,
            importStats: { imported: 280, failed: 10, skipped: 5 },
            vendorName: "ImmuneBoost",
        },
        {
            id: 4032,
            name: "4032 Herbal Detox Leads",
            totalLeadCount: 52789,
            importStats: { imported: 460, failed: 19, skipped: 8 },
            vendorName: "Herbal LifeCare",
        },
        {
            id: 4033,
            name: "4033 Protein Shake Declines",
            totalLeadCount: 29107,
            importStats: { imported: 150, failed: 12, skipped: 7 },
            vendorName: "MuscleMax",
        },
    ],
};

const activeListsSlice = createSlice({
    name: "activeLists",
    initialState,
    reducers: {
        setActiveLists: (state, action) => {
            state.lists = action.payload;
        },
        addActiveList: (state, action) => {
            state.lists.push(action.payload);
        },
        updateActiveList: (state, action) => {
            const index = state.lists.findIndex((list) => list.id === action.payload.id);
            if (index !== -1) {
                state.lists[index] = action.payload;
            }
        },
        deleteActiveList: (state, action) => {
            state.lists = state.lists.filter((list) => list.id !== action.payload);
        },
    },
});

export const { setActiveLists, addActiveList, updateActiveList, deleteActiveList } = activeListsSlice.actions;

export default activeListsSlice.reducer;