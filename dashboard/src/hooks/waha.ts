import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("waha.ts: API_URL initialized to:", API_URL);

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function getWahaQR(): Promise<Blob> {
  const url = `${API_URL}/notifications/waha/qr`;
  console.log("waha.ts: getWahaQR fetching from:", url);
  const response = await fetch(url, {
      headers: {
          ...getHeaders(),
          "Content-Type": undefined as any, 
      }
  });
  if (!response.ok) {
    console.error("waha.ts: getWahaQR failed with status:", response.status);
    throw new Error("Failed to fetch QR code");
  }
  return response.blob();
}

export async function getWahaStatus(): Promise<any> {
  const url = `${API_URL}/notifications/waha/status`;
  const response = await fetch(url, {
      headers: getHeaders(),
  });
  if (!response.ok) {
    console.error("waha.ts: getWahaStatus failed with status:", response.status);
    throw new Error("Failed to fetch status");
  }
  return response.json();
}

export async function startWahaSession(): Promise<any> {
  const url = `${API_URL}/notifications/waha/start`;
  console.log("waha.ts: startWahaSession calling POST to:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    console.error("waha.ts: startWahaSession failed with status:", response.status, "body:", body);
    throw new Error(body?.message || "Failed to start session");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export async function stopWahaSession(): Promise<any> {
  const url = `${API_URL}/notifications/waha/stop`;
  console.log("waha.ts: stopWahaSession calling POST to:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    console.error("waha.ts: stopWahaSession failed with status:", response.status);
    throw new Error("Failed to stop session");
  }
  return response.json();
}

export async function deleteWahaSession(): Promise<any> {
  const url = `${API_URL}/notifications/waha/delete`;
  console.log("waha.ts: deleteWahaSession calling POST to:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    console.error("waha.ts: deleteWahaSession failed with status:", response.status);
    throw new Error("Failed to delete session");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export async function sendWahaMessage(chatId: string, message: string): Promise<any> {
  const response = await fetch(`${API_URL}/notifications/waha/send-text`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ chatId, message }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to send message");
  }
  return response.json();
}
