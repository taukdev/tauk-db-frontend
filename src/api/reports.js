import { apiJson } from "./http.js";
import {
  GET_LIST_IMPORT_STATS_DROPDOWN_PATH,
  GET_LIST_IMPORT_STATS_PATH,
  GET_LEAD_DELIVERY_DROPDOWN_PATH,
  GET_LEAD_DELIVERY_PATH,
  GET_SCRUB_REPORT_PATH,
} from "./ConstAPI.jsx";

/**
 * Fetch list import stats dropdown data
 * @returns {Promise} API response with dropdown options
 */
export async function getListImportStatsDropdownApi() {
  return await apiJson(GET_LIST_IMPORT_STATS_DROPDOWN_PATH, {
    method: "GET",
  });
}

/**
 * Generate list import stats report
 * @param {Object} payload - Report parameters
 * @param {Array<number>} payload.list_ids - Array of list IDs
 * @param {string} payload.start_date - Start date (YYYY-MM-DD)
 * @param {string} payload.end_date - End date (YYYY-MM-DD)
 * @param {boolean} payload.show_daily_breakdown - Whether to show daily breakdown
 * @param {string} payload.import_through - Import type: "CSV", "Webhook", or "Both"
 * @returns {Promise} API response with report data
 */
export async function generateListImportStatsReportApi(payload) {
  return await apiJson(GET_LIST_IMPORT_STATS_PATH, {
    method: "POST",
    json: payload,
  });
}
/**
 * Fetch lead delivery report dropdown data
 * @returns {Promise} API response with dropdown options
 */
export async function getLeadDeliveryDropdownApi() {
  return await apiJson(GET_LEAD_DELIVERY_DROPDOWN_PATH, {
    method: "GET",
  });
}

/**
 * Generate lead delivery report
 * @param {Object} payload - Report parameters
 * @param {Array<number>} payload.platform_ids - Array of platform IDs
 * @param {string} payload.start_date - Start date (YYYY-MM-DD)
 * @param {string} payload.end_date - End date (YYYY-MM-DD)
 * @param {string} payload.leads_type - Lead type: "Abandons Leads" | "Buyers Leads" | "Declines Leads"
 * @param {boolean} payload.subtract_returned_leads - Whether to subtract returned leads
 * @returns {Promise} API response with report data
 */
export async function generateLeadDeliveryReportApi(payload) {
  return await apiJson(GET_LEAD_DELIVERY_PATH, {
    method: "POST",
    json: payload,
  });
}

/**
 * Generate scrub report
 * @param {Object} payload - Report parameters
 * @param {string} payload.start_date - Start date (YYYY-MM-DD)
 * @param {string} payload.end_date - End date (YYYY-MM-DD)
 * @returns {Promise} API response with report data
 */
export async function generateScrubReportApi(payload) {
  return await apiJson(GET_SCRUB_REPORT_PATH, {
    method: "POST",
    json: payload,
  });
}

