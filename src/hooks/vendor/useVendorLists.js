import { useState, useEffect, useCallback } from "react";
import { getVendorListsApi } from "../../api/vendors";

export function useVendorLists({ page = 1, limit = 10 } = {}) {
  const [lists, setLists] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getVendorListsApi(page, limit);

      // Handle different response structures
      // API might return: { data: [...], pagination: {...} } OR { status: "success", data: [...], pagination: {...} }
      let listsData = [];
      let paginationData = null;

      if (Array.isArray(response)) {
        listsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array in data: { data: [...], pagination: {...} }
        listsData = response.data;
        paginationData = response.pagination;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Nested: { data: { data: [...], pagination: {...} } }
        listsData = response.data.data;
        paginationData = response.data.pagination || response.pagination;
      } else if (Array.isArray(response?.data?.lists)) {
        // Alternative structure: { data: { lists: [...], pagination: {...} } }
        listsData = response.data.lists;
        paginationData = response.data.pagination || response.pagination;
      }

      setLists(listsData);
      setPagination(paginationData);

    } catch (err) {
      console.error("Error fetching vendor lists:", err);
      setError(err);
      setLists([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    pagination,
    loading,
    error,
    refetch: fetchLists,
  };
}