import { useState, useEffect } from "react";
import { getStatesByCountryApi } from "../../api/vendors.js";

/**
 * Hook to fetch and manage states by country
 * @param {string|number|null} countryId - Country ID to filter states
 * @returns {Object} { states, loading, error, refetch }
 */
export function useStates(countryId) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStates = async () => {
      if (!countryId) {
        setStates([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getStatesByCountryApi(countryId);
        
        // Handle different response structures
        let statesList = [];
        if (Array.isArray(response)) {
          statesList = response;
        } else if (response?.data && Array.isArray(response.data)) {
          statesList = response.data;
        } else if (response?.data?.states && Array.isArray(response.data.states)) {
          statesList = response.data.states;
        }
        
        // Transform to dropdown format if needed
        const formattedStates = statesList.map((item) => {
          if (typeof item === "string") {
            return { label: item, value: item };
          }
          if (item.label && item.value) {
            return item;
          }
          if (item.name && item.id) {
            return { label: item.name, value: item.id };
          }
          if (item.state) {
            return { label: item.state, value: item.state };
          }
          if (item.state_name) {
            return { label: item.state_name, value: item.state_name };
          }
          return { label: String(item), value: String(item) };
        });
        
        setStates(formattedStates);
      } catch (err) {
        setError(err.message || "Failed to fetch states");
        setStates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [countryId]);

  const refetch = () => {
    if (!countryId) return;
    const fetchStates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getStatesByCountryApi(countryId);
        
        let statesList = [];
        if (Array.isArray(response)) {
          statesList = response;
        } else if (response?.data && Array.isArray(response.data)) {
          statesList = response.data;
        } else if (response?.data?.states && Array.isArray(response.data.states)) {
          statesList = response.data.states;
        }
        
        const formattedStates = statesList.map((item) => {
          if (typeof item === "string") {
            return { label: item, value: item };
          }
          if (item.label && item.value) {
            return item;
          }
          if (item.name && item.id) {
            return { label: item.name, value: item.id };
          }
          if (item.state) {
            return { label: item.state, value: item.state };
          }
          if (item.state_name) {
            return { label: item.state_name, value: item.state_name };
          }
          return { label: String(item), value: String(item) };
        });
        
        setStates(formattedStates);
      } catch (err) {
        setError(err.message || "Failed to fetch states");
        setStates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  };

  return {
    states,
    loading,
    error,
    refetch,
  };
}

