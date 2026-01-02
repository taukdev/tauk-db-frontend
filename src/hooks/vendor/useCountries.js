import { useState, useEffect } from "react";
import { getCountriesApi } from "../../api/vendors.js";

/**
 * Hook to fetch and manage countries
 * @returns {Object} { countries, loading, error, refetch }
 */
export function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCountriesApi();
      
      // Handle different response structures
      let countryList = [];
      if (Array.isArray(response)) {
        countryList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        countryList = response.data;
      } else if (response?.data?.countries && Array.isArray(response.data.countries)) {
        countryList = response.data.countries;
      }
      
      // Transform to dropdown format if needed
      const formattedCountries = countryList.map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        if (item.label && item.value) {
          return item;
        }
        if (item.name && item.id) {
          return { label: item.name, value: item.id };
        }
        if (item.country) {
          return { label: item.country, value: item.country };
        }
        if (item.country_name) {
          return { label: item.country_name, value: item.country_name };
        }
        return { label: String(item), value: String(item) };
      });
      
      setCountries(formattedCountries);
    } catch (err) {
      setError(err.message || "Failed to fetch countries");
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries,
  };
}

