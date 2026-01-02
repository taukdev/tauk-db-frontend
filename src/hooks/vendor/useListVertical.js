import { useEffect, useState } from "react";
import { getListVerticalApi } from "../../api/vendors";

export const useListVertical = () => {
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getListVerticalApi();
        
        // Handle different response structures
        let data = [];
        if (Array.isArray(res)) {
          data = res;
        } else if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (res?.data?.verticals && Array.isArray(res.data.verticals)) {
          data = res.data.verticals;
        }
        
        setVerticals(
          data.map((v) => {
            // Handle different data structures
            if (typeof v === 'string' || typeof v === 'number') {
              return { label: String(v), value: v };
            }
            return {
              label: v.name || v.label || v.vertical_name || String(v),
              value: v.id || v.value || v,
            };
          })
        );
      } catch (err) {
        setError(err.message || 'Failed to fetch list verticals');
        setVerticals([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { verticals, loading, error };
};
