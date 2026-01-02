const AUTH_TOKEN_KEY = "auth_token";
const AUTH_REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_USER_KEY = "user";
const IS_LOGGED_IN_KEY = "isLoggedIn";

function safeParseJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getFromStorage(storage) {
  if (!storage) return null;
  const token = storage.getItem(AUTH_TOKEN_KEY);
  const userRaw = storage.getItem(AUTH_USER_KEY);
  const isLoggedInRaw = storage.getItem(IS_LOGGED_IN_KEY);
  const user = safeParseJson(userRaw) ?? userRaw;
  const isLoggedIn = isLoggedInRaw === "true" || Boolean(token);
  if (!isLoggedIn) return null;
  return { token: token || "", user: user || null, storageType: storage === localStorage ? "local" : "session" };
}

export function getAuth() {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, token: "", user: null, storageType: null };
  }
  // prefer local (remember me) then session
  const fromLocal = getFromStorage(window.localStorage);
  if (fromLocal) return { ...fromLocal, isLoggedIn: true };
  const fromSession = getFromStorage(window.sessionStorage);
  if (fromSession) return { ...fromSession, isLoggedIn: true };
  return { isLoggedIn: false, token: "", user: null, storageType: null };
}

export function getIsLoggedIn() {
  return Boolean(getAuth().isLoggedIn);
}

export function setAuth({ token, user, remember = false, rawResponse } = {}) {
  if (typeof window === "undefined") return;
  
  const storage = window.localStorage;
  
  // Don't store isLoggedIn - only token and user
  if (token && typeof token === "string" && token.trim().length > 0) {
    storage.setItem(AUTH_TOKEN_KEY, token);
  }
  
  if (user !== undefined) {
    const userValue = typeof user === "string" ? user : JSON.stringify(user);
    storage.setItem(AUTH_USER_KEY, userValue);
  } else if (rawResponse !== undefined) {
    const responseValue = JSON.stringify(rawResponse);
    storage.setItem(AUTH_USER_KEY, responseValue);
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(IS_LOGGED_IN_KEY);
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    storage.removeItem(AUTH_USER_KEY);
  }
}

/**
 * Get refresh token from storage
 * @returns {string|null} Refresh token or null
 */
export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || null;
}

/**
 * Set refresh token in storage
 * @param {string} refreshToken - Refresh token to store
 */
export function setRefreshToken(refreshToken) {
  if (typeof window === "undefined") return;
  if (refreshToken && typeof refreshToken === "string" && refreshToken.trim().length > 0) {
    window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }
}


