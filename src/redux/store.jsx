import { configureStore } from '@reduxjs/toolkit';

import breadcrumbReducer from "../features/breadcrumb/breadcrumbSlice";
import userReducer from '../features/auth/userSlice';
import vendorListingReducer from '../features/vendor/vendorListingSlice';
import ActiveList from '../features/dashboard/activeListsSlice';
import platformReducer from '../features/platform/platformSlice';
import platformNotesReducer from '../features/platform/platformNotesSlice';
import platformOrdersReducer from '../features/platform/platformOrdersSlice';
import orderDetailReducer from '../features/platform/orderDetailSlice';
import vendorReducer from '../features/vendor/vendorSlice';
import apiIntegrationsReducer from '../features/platform/apiIntegrationsSlice';
import vendorApiPostingInstructionsReducer from '../features/vendor/vendorApiPostingInstructionsSlice';
import editApiIntegrationsReducer from "../features/platform/editApiIntegrationsSlice";
import sendLeadsReducer from '../features/platform/sendLeadsSlice';
import sendReportReducer from '../features/reports/SendReportSlice.jsx';
import listImportStateReducer from '../features/reports/ListImportStateSlice';
import priorityPostsReducer from "../features/outgoing/priorityPostsSlice";
import importedDataReducer from "../features/outgoing/importedDataSlice";
import leadDeliveryReportReducer from '../features/reports/LeadDeliveryReportSlice';
import scrubReportReducer from '../features/reports/ScrubReportSlice.jsx';
import activeCampaignsReducer from '../features/activeCampaigns/activeCampaignsSlice.jsx';
import platformDetailReducer from '../features/platform/platformDetailSlice';
import biddingPostsReducer from '../features/outgoing/biddingPostsSlice';

export const store = configureStore({
  reducer: {
    breadcrumbs: breadcrumbReducer,
    user: userReducer,
    activeLists: ActiveList,
    platform: platformReducer,
    platformDetail: platformDetailReducer,
    platformNotes: platformNotesReducer,
    platformOrders: platformOrdersReducer,
    orderDetail: orderDetailReducer,
    vendors: vendorReducer,
    vendorListing: vendorListingReducer,
    apiIntegrations: apiIntegrationsReducer,
    vendorApiPostingInstructions: vendorApiPostingInstructionsReducer,
    editApiIntegrations: editApiIntegrationsReducer,
    sendLeads: sendLeadsReducer,
    sendReport: sendReportReducer,
    listImportStates: listImportStateReducer,
    priorityPosts: priorityPostsReducer,
    importedData: importedDataReducer,
    leadDeliveryReport: leadDeliveryReportReducer,
    scrubReport: scrubReportReducer,
    scrubReport: scrubReportReducer,
    activeCampaigns: activeCampaignsReducer,
    biddingPosts: biddingPostsReducer,
  },
});