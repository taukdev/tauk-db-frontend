import { useCallback, useEffect, useState } from "react";
import { meApi } from "../../api/auth.js";

export function useMe({ auto = true } = {}) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState("");

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await meApi();
      setMe(data);
      return data;
    } catch (e) {
      setMe(null);
      setError(e?.message || "Failed to load profile");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    fetchMe();
  }, [auto, fetchMe]);

  return { me, loading, error, refetch: fetchMe, setMe };
}

