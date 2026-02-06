"use client";

import Cookies from "js-cookie";

import { LoginResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();
  
 
  if (data.accessToken) {
      console.log("Login successful. Data:", data);
      setToken(data.accessToken);

      
      let role = data.user?.role;
      
      if (!role && data.accessToken) {
        try {
          const decoded = parseJwt(data.accessToken);
          console.log("Decoded JWT:", decoded);
          if (decoded.role) {
             role = decoded.role;
          }
        } catch (e) {
          console.error("Failed to decode JWT:", e);
        }
      }

      setUser(data.user || { email });
      
      if (role) {
        console.log("Setting role cookie:", role);
        Cookies.set("role", role, { expires: 7, path: '/' });
      } else {
        console.warn("No role found in user data or token!");
      }
  }

  return data;
}

function parseJwt (token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export function logout() {
  Cookies.remove(TOKEN_KEY, { path: '/' });
  Cookies.remove("role", { path: '/' });
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login";
}

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 1, path: '/' }); 
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): any | null {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
