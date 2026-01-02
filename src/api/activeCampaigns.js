import { apiJson } from "./http.js";
import {
    GET_ACTIVE_CAMPAIGNS_PATH,
    ACTIVE_CAMPAIGN_PATH,
    GET_CAMPAIGNS_DROPDOWN_PATH,
    GET_TEAMS_PATH,
    TEAM_PATH,
    GET_VENDORS_FOR_ACTIVE_CAMPAIGN_PATH,
    VENDOR_FOR_ACTIVE_CAMPAIGN_PATH
} from "./ConstAPI.jsx";

/**
 * Get active campaigns with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} API response
 */
export async function getActiveCampaignsApi(page = 1, limit = 10) {
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    return await apiJson(`${GET_ACTIVE_CAMPAIGNS_PATH}?${queryParams}`, {
        method: "GET",
    });
}

/**
 * Create a new active campaign
 * @param {Object} payload - { list_ids: [], vendor_id: number, team_id: number, description: string }
 * @returns {Promise} API response
 */
export async function createActiveCampaignApi(payload) {
    return await apiJson(ACTIVE_CAMPAIGN_PATH, {
        method: "POST",
        json: payload,
    });
}

/**
 * Get a single active campaign by ID
 * @param {number|string} id 
 * @returns {Promise} API response
 */
export async function getActiveCampaignByIdApi(id) {
    return await apiJson(`${ACTIVE_CAMPAIGN_PATH}/${id}`, {
        method: "GET",
    });
}

/**
 * Update an existing active campaign
 * @param {number|string} id 
 * @param {Object} payload - { list_ids: [], vendor_id: number, team_id: number, description: string }
 * @returns {Promise} API response
 */
export async function updateActiveCampaignApi(id, payload) {
    return await apiJson(`${ACTIVE_CAMPAIGN_PATH}/${id}`, {
        method: "PATCH",
        json: payload,
    });
}

/**
 * Delete an active campaign
 * @param {number|string} id 
 * @returns {Promise} API response
 */
export async function deleteActiveCampaignApi(id) {
    return await apiJson(`${ACTIVE_CAMPAIGN_PATH}/${id}`, {
        method: "DELETE",
    });
}

/**
 * Get campaigns dropdown data (List IDs)
 * @returns {Promise} API response
 */
export async function getCampaignsDropdownApi() {
    return await apiJson(GET_CAMPAIGNS_DROPDOWN_PATH, {
        method: "GET",
    });
}

/**
 * Get all teams
 * @returns {Promise} API response
 */
export async function getTeamsApi() {
    return await apiJson(GET_TEAMS_PATH, {
        method: "GET",
    });
}

/**
 * Create a new team
 * @param {string} teamName 
 * @returns {Promise} API response
 */
export async function createTeamApi(teamName) {
    return await apiJson(TEAM_PATH, {
        method: "POST",
        json: { team_name: teamName },
    });
}

/**
 * Update an existing team
 * @param {number|string} id 
 * @param {string} teamName 
 * @returns {Promise} API response
 */
export async function updateTeamApi(id, teamName) {
    return await apiJson(`${TEAM_PATH}/${id}`, {
        method: "PATCH",
        json: { team_name: teamName },
    });
}

/**
 * Delete a team
 * @param {number|string} id 
 * @returns {Promise} API response
 */
export async function deleteTeamApi(id) {
    return await apiJson(`${TEAM_PATH}/${id}`, {
        method: "DELETE",
    });
}

/**
 * Get all vendors for active campaign
 * @returns {Promise} API response
 */
export async function getVendorsForActiveCampaignApi() {
    return await apiJson(GET_VENDORS_FOR_ACTIVE_CAMPAIGN_PATH, {
        method: "GET",
    });
}

/**
 * Create a new vendor for active campaign
 * @param {string} vendorName 
 * @returns {Promise} API response
 */
export async function createVendorForActiveCampaignApi(vendorName) {
    return await apiJson(VENDOR_FOR_ACTIVE_CAMPAIGN_PATH, {
        method: "POST",
        json: { vendor_name: vendorName },
    });
}

/**
 * Update an existing vendor for active campaign
 * @param {number|string} id 
 * @param {string} vendorName 
 * @returns {Promise} API response
 */
export async function updateVendorForActiveCampaignApi(id, vendorName) {
    return await apiJson(`${VENDOR_FOR_ACTIVE_CAMPAIGN_PATH}/${id}`, {
        method: "PATCH",
        json: { vendor_name: vendorName },
    });
}

/**
 * Delete a vendor for active campaign
 * @param {number|string} id 
 * @returns {Promise} API response
 */
export async function deleteVendorForActiveCampaignApi(id) {
    return await apiJson(`${VENDOR_FOR_ACTIVE_CAMPAIGN_PATH}/${id}`, {
        method: "DELETE",
    });
}
