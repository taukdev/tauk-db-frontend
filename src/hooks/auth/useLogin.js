import { useCallback, useState } from "react";
import { loginApi } from "../../api/auth.js";
import { setAuth, setRefreshToken } from "../../auth/authStorage.js";

function pickToken(response) {
  if (!response) return "";
  if (typeof response === "string") return response;
  
  // Try multiple possible token locations
  return (
    response?.data?.tokens?.access_token || 
    response?.data?.access_token ||
    ""
  );
}

function pickRefreshToken(response) {
  if (!response || typeof response !== "object") return "";
  
  // Try multiple possible refresh token locations
  return (
    response?.data?.tokens?.refresh_token ||
    response?.data?.refresh_token ||
    response?.refresh_token ||
    ""
  );
}

function pickUser(response) {
  if (!response || typeof response !== "object") return null;
  
  // Try multiple possible user locations
  return (
    response?.data?.user ||  
    response.user ||
    response.profile ||
    null
  );
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async ({ email, password, remember = false }) => {
    setLoading(true);
    setError("");
    try {
      const response = await loginApi({ email, password });
      const token = pickToken(response);
      const refreshToken = pickRefreshToken(response);
      const user = pickUser(response);

      if (!token) {
        throw new Error("Login response missing access token");
      }
      
      setAuth({ token, user, remember, rawResponse: response });
      
      // Store refresh token if available
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      
      return response;
    } catch (e) {
      const msg = e?.message || "Login failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error, setError };
}

