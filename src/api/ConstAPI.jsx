// Central place for API endpoint paths (do not include base URL here)
export const AUTH_LOGIN_PATH = "/auth/login";
export const AUTH_ME_PATH = "/auth/me";
export const AUTH_REFRESH_TOKEN_PATH = "/auth/refresh";

// Vendor endpoints
export const GET_VENDORS_PATH = "/general/vendors";
export const GET_VENDOR_BY_ID_PATH = "/general/vendor";
export const UPDATE_VENDOR_PATH = "/general/vendor";
export const ACTIVATE_VENDOR_PATH = "/general/vendor/activate";
export const DEACTIVATE_VENDOR_PATH = "/general/vendor/deactivate";
export const GET_VENDOR_TYPES_PATH = "/general/vendor-types";
export const GET_PAYMENT_TERMS_PATH = "/general/payment-terms";
export const GET_COUNTRIES_PATH = "/general/countries";
export const GET_STATES_PATH = "/general/states";
export const GET_STATES_BY_COUNTRY_PATH = "/general/states/country";
export const CREATE_VENDOR_PATH = "/general/vendor";
export const SEARCH_VENDORS_PATH = "/general/vendors/search";

//vendor list endpoints
export const GET_VENDOR_LISTS_PATH = "/general/lists";
export const GET_LISTS_DROPDOWN_PATH = "/general/lists/dropdown";
export const CREATE_LIST_PATH = "/general/list";
export const UPDATE_LIST_PATH = "/general/list";
export const ACTIVATE_LIST_PATH = "/general/list/activate";
export const DEACTIVATE_LIST_PATH = "/general/list/deactivate";
export const GET_LIST_BY_ID_PATH = "/general/list";
export const GET_LIST_VERTICAL_PATH = "/general/list-verticals";
export const GET_DEDUPE_BACK_PATH = "/general/dedupe-backs/user";
export const UPLOAD_CSV_PATH = "/general/list/upload-csv";

// Active Campaigns
export const GET_ACTIVE_CAMPAIGNS_PATH = "/general/active-campaigns";
export const ACTIVE_CAMPAIGN_PATH = "/general/active-campaign";
export const GET_CAMPAIGNS_DROPDOWN_PATH = "/general/campaigns/dropdown";
export const GET_TEAMS_PATH = "/general/teams";
export const TEAM_PATH = "/general/team";
export const GET_VENDORS_FOR_ACTIVE_CAMPAIGN_PATH = "/general/vendors-for-active-campaign";
export const VENDOR_FOR_ACTIVE_CAMPAIGN_PATH = "/general/vendor-for-active-campaign";

// Platforms
export const GET_PLATFORMS_PATH = "/general/platforms";
export const PLATFORM_PATH = "/general/platform";
export const GET_PLATFORM_TYPES_PATH = "/general/platform-types";
export const GET_LEAD_RETURN_CUTOFFS_PATH = "/general/lead-return-cutoffs";
export const ACTIVATE_PLATFORM_PATH = "/general/platform/activate";
export const DEACTIVATE_PLATFORM_PATH = "/general/platform/deactivate";
export const API_INTEGRATION_PATH = "/general/platform";

// Outgoing
export const GET_OUTGOING_POSTS_PATH = "/general/outgoing-posts";
export const GET_PRIORITY_POSTS_PATH = "/general/outgoing-posts/priority";
export const GET_BIDDING_POSTS_PATH = "/general/outgoing-posts/bidding";

// Reports
export const GET_LIST_IMPORT_STATS_DROPDOWN_PATH = "/general/reports/list-import-stats/dropdown";
export const GET_LIST_IMPORT_STATS_PATH = "/general/reports/list-import-stats";
export const GET_LEAD_DELIVERY_DROPDOWN_PATH = "/general/reports/lead-delivery/dropdown";
export const GET_LEAD_DELIVERY_PATH = "/general/reports/lead-delivery";
export const GET_SCRUB_REPORT_PATH = "/general/reports/scrub"; 