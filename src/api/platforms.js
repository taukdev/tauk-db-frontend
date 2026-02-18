import { apiJson } from "./http.js";
import {
    GET_PLATFORMS_PATH,
    PLATFORM_PATH,
    GET_LEAD_RETURN_CUTOFFS_PATH,
    GET_COUNTRIES_PATH,
    GET_STATES_PATH,
    GET_STATES_BY_COUNTRY_PATH,
    GET_PAYMENT_TERMS_PATH,
    GET_PLATFORM_TYPES_PATH,
    ACTIVATE_PLATFORM_PATH,
    DEACTIVATE_PLATFORM_PATH,
    GET_LISTS_DROPDOWN_PATH
} from "./ConstAPI";

/**
 * Fetch all platforms
 * @returns {Promise} API response
 */
export async function getPlatformsApi() {
    return await apiJson(GET_PLATFORMS_PATH, {
        method: "GET",
    });
}

/**
 * Create a new platform
 * @param {Object} payload 
 * @returns {Promise} API response
 */
export async function createPlatformApi(payload) {
    return await apiJson(PLATFORM_PATH, {
        method: "POST",
        json: payload,
    });
}

/**
 * Fetch lead return cutoffs
 * @returns {Promise} API response
 */
export async function getLeadReturnCutoffsApi() {
    return await apiJson(GET_LEAD_RETURN_CUTOFFS_PATH, {
        method: "GET",
    });
}

/**
 * Fetch generic dropdown data
 */
export async function getCountriesApi() {
    return await apiJson(GET_COUNTRIES_PATH, { method: "GET" });
}

/**
 * Fetch all states
 * @returns {Promise} API response
 */
export async function getStatesApi() {
    return await apiJson(GET_STATES_PATH, { method: "GET" });
}

export async function getStatesByCountryApi(countryId) {
    return await apiJson(`${GET_STATES_BY_COUNTRY_PATH}/${countryId}`, { method: "GET" });
}

export async function getPaymentTermsApi() {
    return await apiJson(GET_PAYMENT_TERMS_PATH, { method: "GET" });
}

export async function getPlatformByIdApi(id) {
    return await apiJson(`${PLATFORM_PATH}/${id}`, { method: "GET" });
}

export async function updatePlatformApi(id, payload) {
    return await apiJson(`${PLATFORM_PATH}/${id}`, {
        method: "PATCH",
        json: payload,
    });
}

export async function getPlatformNotesApi(id) {
    return await apiJson(`${PLATFORM_PATH}/${id}/notes`, { method: "GET" });
}

export async function createPlatformNoteApi(id, payload) {
    return await apiJson(`${PLATFORM_PATH}/${id}/note`, {
        method: "POST",
        json: payload,
    });
}

export async function getPlatformTypesApi() {
    return await apiJson(GET_PLATFORM_TYPES_PATH, { method: "GET" });
}

export async function activatePlatformApi(id) {
    return await apiJson(`${ACTIVATE_PLATFORM_PATH}/${id}`, { method: "PATCH" });
}

export async function deactivatePlatformApi(id) {
    return await apiJson(`${DEACTIVATE_PLATFORM_PATH}/${id}`, { method: "PATCH" });
}

export async function getPlatformOrdersApi(platformId) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/orders`, { method: "GET" });
}

export async function getPlatformOrderByIdApi(platformId, orderId) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/order/${orderId}`, { method: "GET" });
}

// API (Integrations)
export async function createApiIntegrationApi(platformId, payload) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/api-integration`, {
        method: "POST",
        json: payload,
    });
}

export async function getApiIntegrationsApi(platformId) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/api-integrations`, { method: "GET" });
}

export async function getApiIntegrationByIdApi(platformId, integrationId) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/api-integration/${integrationId}`, { method: "GET" });
}

export async function updateApiIntegrationApi(platformId, integrationId, payload) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/api-integration/${integrationId}`, {
        method: "PATCH",
        json: payload,
    });
}

export async function deleteApiIntegrationApi(platformId, integrationId) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/api-integration/${integrationId}`, { method: "DELETE" });
}

/**
 * Fetch platform presets by provider
 * @param {string} serviceProvider - Service provider name
 * @returns {Promise} API response
 */
export async function getPlatformPresetsByProviderApi(serviceProvider) {
    const url = serviceProvider 
        ? `/platform-presets/by-provider?service_provider=${serviceProvider}`
        : '/platform-presets/by-provider';
    
    return await apiJson(url, {
        method: "GET",
    });
}

/**
 * Create a platform order
 * @param {number} platformId - Platform ID
 * @param {Object} payload - Order payload
 * @returns {Promise} API response
 */
export async function createPlatformOrderApi(platformId, payload) {
    return await apiJson(`${PLATFORM_PATH}/${platformId}/order`, {
        method: "POST",
        json: payload,
    });
}

/**
 * Fetch lists dropdown data
 * @returns {Promise} API response
 */
export async function getListsDropdownApi() {
    return await apiJson(GET_LISTS_DROPDOWN_PATH, {
        method: "GET",
    });
}