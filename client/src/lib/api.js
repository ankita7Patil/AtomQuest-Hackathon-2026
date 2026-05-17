const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("goal_token");
}

export function setSession({ token, user }) {
  localStorage.setItem("goal_token", token);
  localStorage.setItem("goal_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("goal_token");
  localStorage.removeItem("goal_user");
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("goal_user"));
  } catch {
    return null;
  }
}

export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(error.message || "Request failed.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/csv")) return response.text();
  return response.json();
}

export { API_URL };
