import { apiJson, axiosInstance } from "./http.js";
import { GET_VENDORS_PATH, GET_VENDOR_BY_ID_PATH, UPDATE_VENDOR_PATH, ACTIVATE_VENDOR_PATH, DEACTIVATE_VENDOR_PATH, GET_VENDOR_TYPES_PATH, GET_PAYMENT_TERMS_PATH, GET_COUNTRIES_PATH, GET_STATES_BY_COUNTRY_PATH, CREATE_VENDOR_PATH, SEARCH_VENDORS_PATH, GET_VENDOR_LISTS_PATH, CREATE_LIST_PATH, UPDATE_LIST_PATH, ACTIVATE_LIST_PATH, DEACTIVATE_LIST_PATH, GET_LIST_BY_ID_PATH, GET_LIST_VERTICAL_PATH, GET_DEDUPE_BACK_PATH, UPLOAD_CSV_PATH, GET_VENDOR_API_CONFIGS_PATH,UPDATE_LIST_STATUS_PATH } from "./ConstAPI.jsx";

/**
 * Get vendor by ID
 * @param {string|number} vendorId - Vendor ID
 * @returns {Promise} API response with vendor data
 */
export async function getVendorByIdApi(vendorId) {
  if (!vendorId) {
    throw new Error("Vendor ID is required");
  }

  // Token automatically attached by Axios interceptor
  return await apiJson(`${GET_VENDOR_BY_ID_PATH}/${vendorId}`, {
    method: "GET",
  });
}

/**
 * Get vendors list with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Promise} API response with vendors data
 */
export async function getVendorsApi(page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Token automatically attached by Axios interceptor
  return await apiJson(`${GET_VENDORS_PATH}?${queryParams}`, {
    method: "GET",
  });
}

/**
 * Get vendor types list
 * @returns {Promise} API response with vendor types data
 */
export async function getVendorTypesApi() {
  // Token automatically attached by Axios interceptor
  return await apiJson(GET_VENDOR_TYPES_PATH, {
    method: "GET",
  });
}

/**
 * Get payment terms list
 * @returns {Promise} API response with payment terms data
 */
export async function getPaymentTermsApi() {
  // Token automatically attached by Axios interceptor
  return await apiJson(GET_PAYMENT_TERMS_PATH, {
    method: "GET",
  });
}

/**
 * Get countries list
 * @returns {Promise} API response with countries data
 */
export async function getCountriesApi() {
  // Token automatically attached by Axios interceptor
  return await apiJson(GET_COUNTRIES_PATH, {
    method: "GET",
  });
}

/**
 * Get states list by country ID
 * @param {string|number} countryId - Country ID to filter states
 * @returns {Promise} API response with states data
 */
export async function getStatesByCountryApi(countryId) {
  if (!countryId) {
    throw new Error("Country ID is required to fetch states");
  }

  // Token automatically attached by Axios interceptor
  return await apiJson(`${GET_STATES_BY_COUNTRY_PATH}/${countryId}`, {
    method: "GET",
  });
}

/**
 * Create a new vendor
 * @param {Object} payload - Vendor data payload
 * @returns {Promise} API response
 */
export async function createVendorApi(payload) {
  // Token automatically attached by Axios interceptor
  return await apiJson(CREATE_VENDOR_PATH, {
    method: "POST",
    json: payload,
  });
}

/**
 * Search vendors with filters
 * @param {Object} params - Search parameters
 * @param {string} params.search - Search query
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.is_active - Active status filter
 * @param {string} params.vendor_type - Vendor type filter
 * @param {string} params.country - Country filter
 * @returns {Promise} API response with vendors data
 */
export async function searchVendorsApi({
  search = "",
  page = 1,
  limit = 10,
  is_active = "",
  vendor_type = "",
  country = "",
}) {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (is_active) queryParams.append("is_active", is_active);
  if (vendor_type) queryParams.append("vendor_type", vendor_type);
  if (country) queryParams.append("country", country);

  // Token automatically attached by Axios interceptor
  return await apiJson(`${SEARCH_VENDORS_PATH}?${queryParams}`, {
    method: "GET",
  });
}

/**
 * Update vendor by ID
 * @param {string|number} vendorId - Vendor ID
 * @param {Object} payload - Vendor data payload
 * @returns {Promise} API response
 */
export async function updateVendorApi(vendorId, payload) {
  if (!vendorId) {
    throw new Error("Vendor ID is required");
  }

  // Token automatically attached by Axios interceptor
  return await apiJson(`${UPDATE_VENDOR_PATH}/${vendorId}`, {
    method: "PATCH",
    json: payload,
  });
}

/**
 * Activate vendor by ID
 * @param {string|number} vendorId - Vendor ID
 * @returns {Promise} API response
 */
export async function activateVendorApi(vendorId) {
  if (!vendorId) {
    throw new Error("Vendor ID is required");
  }

  // Token automatically attached by Axios interceptor
  return await apiJson(`${ACTIVATE_VENDOR_PATH}/${vendorId}`, {
    method: "PATCH",
  });
}

/**
 * Deactivate vendor by ID
 * @param {string|number} vendorId - Vendor ID
 * @returns {Promise} API response
 */
export async function deactivateVendorApi(vendorId) {
  if (!vendorId) {
    throw new Error("Vendor ID is required");
  }

  // Token automatically attached by Axios interceptor
  return await apiJson(`${DEACTIVATE_VENDOR_PATH}/${vendorId}`, {
    method: "PATCH",
  });
}


/**
 * Get all general lists (paginated)
 * @param {number} page
 * @param {number} limit
 * @param {string|number} vendorId - Optional vendor ID to filter lists by vendor
 */
export async function getVendorListsApi(
  page = 1,
  limit = 10,
  vendorId = null,
  listStatus = null
) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (vendorId) {
    queryParams.append("vendor_id", vendorId.toString());
  }

  // Optionally send list status (e.g., "active", "archived") so backend
  // can filter server-side. This follows the user's request to send
  // listStatus together with vendorId.
  if (listStatus) {
    queryParams.append("list_status", listStatus.toString());
  }

  return await apiJson(`${GET_VENDOR_LISTS_PATH}?${queryParams}`, {
    method: "GET",
  });
}

/**
 * Create a new list
 * @param {Object} payload - List data payload
 * @returns {Promise} API response
 */
export async function createListApi(payload) {
  return await apiJson(CREATE_LIST_PATH, {
    method: "POST",
    json: payload,
  });
}

/**
 * Get vendor list by ID
 * @param {string|number} listId
 * @returns {Promise} API response
 */
export async function getVendorListByIdApi(listId) {
  if (!listId) {
    throw new Error("List ID is required");
  }

  return await apiJson(`${GET_LIST_BY_ID_PATH}/${listId}`, {
    method: "GET",
  });
}

/**
 * Update vendor list by ID
 * @param {string|number} listId
 * @param {Object} payload
 * @returns {Promise} API response
 */
export async function updateListApi(listId, payload) {
  if (!listId) {
    throw new Error("List ID is required");
  }

  return await apiJson(`${UPDATE_LIST_PATH}/${listId}`, {
    method: "PATCH",
    json: payload,
  });
}

/**
 * Activate vendor list by ID
 * @param {string|number} listId
 * @returns {Promise} API response
 */
export async function activateListApi(listId) {
  if (!listId) {
    throw new Error("List ID is required");
  }

  return await apiJson(`${ACTIVATE_LIST_PATH}/${listId}`, {
    method: "PATCH",
  });
}

/**
 * Deactivate vendor list by ID
 * @param {string|number} listId
 * @returns {Promise} API response
 */
export async function deactivateListApi(listId) {
  if (!listId) {
    throw new Error("List ID is required");
  }

  return await apiJson(`${DEACTIVATE_LIST_PATH}/${listId}`, {
    method: "PATCH",
  });
}

/**
 * Update list status (e.g., archived, active)
 * PATCH /general/list/status/:listId
 * @param {string|number} listId
 * @param {string} status - New status value (e.g., "archived", "active")
 */
export async function updateListStatusApi(listId, status) {
  if (!listId) {
    throw new Error("List ID is required");
  }
  if (!status) {
    throw new Error("Status is required");
  }

  return await apiJson(`${UPDATE_LIST_STATUS_PATH}/${listId}`, {
    method: "PATCH",
    json: { status },
  });
}

/**
 * Get list vertical
 * @returns {Promise} API response with list vertical data
 */
export async function getListVerticalApi() {
  return await apiJson(GET_LIST_VERTICAL_PATH, {
    method: "GET",
  });
}

/**
 * Get dedupe back
 * @returns {Promise} API response with dedupe back data
 */
export async function getDedupeBackApi() {
  return await apiJson(GET_DEDUPE_BACK_PATH, {
    method: "GET",
  });
}

/**
 * Get vendor API configs (all lists with API configs for a vendor)
 * @param {string|number} vendorId - Vendor ID
 * @returns {Promise} API response with vendor data and lists with api_configs
 */
export async function getVendorApiConfigsApi(vendorId) {
  if (!vendorId) {
    throw new Error("Vendor ID is required");
  }

  return await apiJson(`${GET_VENDOR_API_CONFIGS_PATH}/${vendorId}`, {
    method: "GET",
  });
}

/**
 * Upload CSV file to a list
 * @param {string|number} listId - List ID
 * @param {FormData} formData - FormData containing csv_file, delimiter, has_header_row, has_opt_in_dates
 * @returns {Promise} API response
 */
export async function uploadCsvApi(listId, formData) {
  if (!listId) {
    throw new Error("List ID is required");
  }
  if (!formData) {
    throw new Error("FormData is required");
  }

  // Use axiosInstance directly for FormData (multipart/form-data)
  const response = await axiosInstance.post(
    `${UPLOAD_CSV_PATH}/${listId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

