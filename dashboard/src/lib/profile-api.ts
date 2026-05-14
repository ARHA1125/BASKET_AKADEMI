"use client";

import { authenticatedFetch } from "./api-client";
import { UpdateProfileData, ChangePasswordData } from "@/types/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyProfile() {
  const response = await authenticatedFetch(`${API_URL}/auth/me`);
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return response.json();
}

export async function updateProfile(data: UpdateProfileData) {
  const response = await authenticatedFetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }
  return response.json();
}

export async function changePassword(data: ChangePasswordData) {
  const { confirmPassword, ...payload } = data;
  const response = await authenticatedFetch(`${API_URL}/auth/profile/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to change password");
  }
  return response.json();
}

export async function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authenticatedFetch(`${API_URL}/auth/profile/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload photo");
  }
  return response.json();
}
