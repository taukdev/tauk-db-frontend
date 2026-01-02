import { useState, useEffect } from "react";
import { getPaymentTermsApi } from "../../api/vendors.js";

/**
 * Hook to fetch and manage payment terms
 * @returns {Object} { paymentTerms, loading, error, refetch }
 */
export function usePaymentTerms() {
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentTerms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPaymentTermsApi();
      
      // Handle different response structures
      let terms = [];
      if (Array.isArray(response)) {
        terms = response;
      } else if (response?.data && Array.isArray(response.data)) {
        terms = response.data;
      } else if (response?.data?.payment_terms && Array.isArray(response.data.payment_terms)) {
        terms = response.data.payment_terms;
      }
      
      // Transform to dropdown format if needed
      const formattedTerms = terms.map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        if (item.label && item.value) {
          return item;
        }
        if (item.name && item.id) {
          return { label: item.name, value: item.id };
        }
        if (item.term) {
          return { label: item.term, value: item.term };
        }
        return { label: String(item), value: String(item) };
      });
      
      setPaymentTerms(formattedTerms);
    } catch (err) {
      setError(err.message || "Failed to fetch payment terms");
      setPaymentTerms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentTerms();
  }, []);

  return {
    paymentTerms,
    loading,
    error,
    refetch: fetchPaymentTerms,
  };
}

