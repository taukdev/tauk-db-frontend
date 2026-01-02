import { useEffect, useState } from "react";
import { getDedupeBackApi } from "../../api/vendors";

export const useDedupeBack = () => {
  const [dedupeBacks, setDedupeBacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getDedupeBackApi();

        // normalize response
        const data =
          res?.data?.dedupe_backs ||
          res?.data?.data ||
          res?.data ||
          res ||
          [];

        const formatted = data
          .map((item) => {
            // Case 1: Proper object from API
            // { id: 30, label: "30 Days" }
            if (typeof item === "object") {
              return {
                label: item.label,            
                value: item.id ?? item.value,
              };
            }

            // Case 2: string like "30 Days"
            if (typeof item === "string") {
              const match = item.match(/\d+/);
              return {
                label: item,
                value: match ? Number(match[0]) : null,
              };
            }

            // Case 3: number
            if (typeof item === "number") {
              return {
                label: `${item} Days`,
                value: item,
              };
            }

            return null;
          })
          .filter(Boolean);

        setDedupeBacks(formatted);
      } catch (err) {
        setError(err.message || "Failed to fetch dedupe backs");
        setDedupeBacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { dedupeBacks, loading, error };
};
