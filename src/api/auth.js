import { apiJson } from "./http.js";
import { AUTH_LOGIN_PATH, AUTH_ME_PATH, AUTH_REFRESH_TOKEN_PATH } from "./ConstAPI.jsx";
import { getAuth, setAuth, getRefreshToken, setRefreshToken } from "../auth/authStorage.js";

export async function loginApi({ email, password }) {
  return await apiJson(AUTH_LOGIN_PATH, {
    method: "POST",
    json: { email, password },
  });
}

export async function meApi() {
  // Token automatically attached by Axios interceptor
  return await apiJson(AUTH_ME_PATH, {
    method: "GET",
  });
}

/**
 * Refresh access token using refresh token
 * @returns {Promise} API response with new tokens
 */
export async function refreshTokenApi() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available. Please login again.");
  }

  const response = await apiJson(AUTH_REFRESH_TOKEN_PATH, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  // Extract and save new tokens from response.data
  const newAccessToken = response?.data?.access_token;
  const newRefreshToken = response?.data?.refresh_token;
  
  if (!newAccessToken) {
    throw new Error("Refresh token response missing access_token");
  }
  
  // Save new tokens
  const { user } = getAuth();
  setAuth({ token: newAccessToken, user });
  
  if (newRefreshToken) {
    setRefreshToken(newRefreshToken);
  }

  return response;
}


