// Vite env vars must start with VITE_
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim() + "/api";

export function getApiBaseUrl() {
  return API_BASE_URL;
}