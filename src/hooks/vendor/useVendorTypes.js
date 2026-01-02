import { useState, useEffect } from "react";
import { getVendorTypesApi } from "../../api/vendors.js";

/**
 * Hook to fetch and manage vendor types
 * @returns {Object} { vendorTypes, loading, error, refetch }
 */
export function useVendorTypes() {
  const [vendorTypes, setVendorTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVendorTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVendorTypesApi();
      
      // Handle different response structures
      let types = [];
      if (Array.isArray(response)) {
        types = response;
      } else if (response?.data && Array.isArray(response.data)) {
        types = response.data;
      } else if (response?.data?.vendor_types && Array.isArray(response.data.vendor_types)) {
        types = response.data.vendor_types;
      }
      
      // Transform to dropdown format if needed
      // If API returns { id, name } or { value, label }, use as is
      // Otherwise, transform to { label, value } format
      const formattedTypes = types.map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        if (item.label && item.value) {
          return item;
        }
        if (item.name && item.id) {
          return { label: item.name, value: item.id };
        }
        if (item.type) {
          return { label: item.type, value: item.type };
        }
        return { label: String(item), value: String(item) };
      });
      
      setVendorTypes(formattedTypes);
    } catch (err) {
      setError(err.message || "Failed to fetch vendor types");
      setVendorTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorTypes();
  }, []);

  return {
    vendorTypes,
    loading,
    error,
    refetch: fetchVendorTypes,
  };
}

