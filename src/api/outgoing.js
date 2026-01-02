import { apiJson } from "./http";
import { GET_OUTGOING_POSTS_PATH, GET_PRIORITY_POSTS_PATH, GET_BIDDING_POSTS_PATH } from "./ConstAPI";

/**
 * Fetch outgoing posts with pagination, search, and filters
 * @param {Object} params - Query parameters (page, limit, search, etc.)
 * @returns {Promise} API response
 */
export async function getOutgoingPostsApi(params = {}) {
    // Construct query string
    const query = new URLSearchParams(params).toString();
    const path = query ? `${GET_OUTGOING_POSTS_PATH}?${query}` : GET_OUTGOING_POSTS_PATH;

    return await apiJson(path, {
        method: "GET",
    });
}

/**
 * Fetch priority posts with optional filters
 * @param {Object} params - Query parameters (platform_id, status, etc.)
 * @returns {Promise} API response
 */
export async function getPriorityPostsApi(params = {}) {
    // Construct query string
    const query = new URLSearchParams(params).toString();
    const path = query ? `${GET_PRIORITY_POSTS_PATH}?${query}` : GET_PRIORITY_POSTS_PATH;

    return await apiJson(path, {
        method: "GET",
    });
}

/**
 * Fetch bidding posts with pagination
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise} API response
 */
export async function getBiddingPostsApi(params = {}) {
    // Construct query string
    const query = new URLSearchParams(params).toString();
    const path = query ? `${GET_BIDDING_POSTS_PATH}?${query}` : GET_BIDDING_POSTS_PATH;

    return await apiJson(path, {
        method: "GET",
    });
}
