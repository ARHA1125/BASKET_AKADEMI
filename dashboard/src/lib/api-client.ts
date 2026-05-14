"use client";

import Cookies from "js-cookie";

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = Cookies.get("auth_token");

  if (!token) {
    console.error("[API Client] No auth token found");
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
    throw new Error("No authentication token found");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    console.error("[API Client] 401 Unauthorized - Session expired");
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  return response;
}
