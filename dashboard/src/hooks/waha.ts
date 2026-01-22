import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function getWahaQR(): Promise<Blob> {
  const response = await fetch(`${API_URL}/notifications/waha/qr`, {
      headers: {
          ...getHeaders(),
          "Content-Type": undefined as any, 
      }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch QR code");
  }
  return response.blob();
}

export async function getWahaStatus(): Promise<any> {
  const response = await fetch(`${API_URL}/notifications/waha/status`, {
      headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }
  return response.json();
}

export async function startWahaSession(): Promise<any> {
  const response = await fetch(`${API_URL}/notifications/waha/start`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to start session");
  }
  return response.json();
}

export async function stopWahaSession(): Promise<any> {
  const response = await fetch(`${API_URL}/notifications/waha/stop`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to stop session");
  }
  return response.json();
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
