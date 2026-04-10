import { getToken } from '@/lib/auth';
import { useCallback, useEffect, useState } from 'react';

type DeliveryKind =
  | 'INVOICE'
  | 'MANUAL_LATE_INVOICE'
  | 'REMINDER'
  | 'BROADCAST';

type DeliveryStatus = 'QUEUED' | 'SENT' | 'ACKED' | 'FAILED' | 'SKIPPED';

type DeliveryOverview = {
  summary: {
    queued: number;
    sent: number;
    acked: number;
    failed: number;
    completedToday: number;
  };
  activeByKind: Array<{
    kind: DeliveryKind;
    active: number;
    queued: number;
    sent: number;
    acked: number;
    failed: number;
    nextScheduledFor: string | null;
    latestScheduledFor: string | null;
    estimatedMinutesRemaining: number;
    isRunning: boolean;
  }>;
  runningBatches: Record<string, boolean>;
  recent: Array<{
    id: string;
    kind: DeliveryKind;
    status: DeliveryStatus;
    recipientChatId: string;
    invoiceId: string | null;
    broadcastLogId: string | null;
    scheduledFor: string | null;
    sentAt: string | null;
    ackedAt: string | null;
    failedAt: string | null;
    attempts: number;
    error: string | null;
    createdAt: string;
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useDeliveryMonitor(autoRefreshMs = 30000) {
  const [overview, setOverview] = useState<DeliveryOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/notifications/deliveries/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch delivery overview');
      }

      const data = await response.json();
      setOverview(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch delivery overview', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview().catch(() => undefined);
  }, [fetchOverview]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchOverview().catch(() => undefined);
    }, autoRefreshMs);

    return () => window.clearInterval(interval);
  }, [autoRefreshMs, fetchOverview]);

  const retryDelivery = useCallback(async (deliveryId: string) => {
    setRetryingId(deliveryId);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/notifications/deliveries/retry/${deliveryId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to retry delivery');
      }

      const data = await response.json();
      await fetchOverview();
      return data;
    } finally {
      setRetryingId(null);
    }
  }, [fetchOverview]);

  return {
    overview,
    loading,
    retryingId,
    refreshOverview: fetchOverview,
    retryDelivery,
  };
}
