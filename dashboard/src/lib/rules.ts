import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface AutomationRule {
  id: string;
  name: string;
  keyword: string;
  response: string;
  isActive: boolean;
  createdAt?: string;
}

export async function getRules(): Promise<AutomationRule[]> {
  const response = await fetch(`${API_URL}/notification-rules`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch rules");
  return response.json();
}

export async function createRule(rule: Partial<AutomationRule>): Promise<AutomationRule> {
  const response = await fetch(`${API_URL}/notification-rules`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(rule),
  });
  if (!response.ok) throw new Error("Failed to create rule");
  return response.json();
}

export async function updateRule(id: string, rule: Partial<AutomationRule>): Promise<AutomationRule> {
  const response = await fetch(`${API_URL}/notification-rules/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(rule),
  });
  if (!response.ok) throw new Error("Failed to update rule");
  return response.json();
}

export async function deleteRule(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/notification-rules/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete rule");
}
