import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getToken } from '@/lib/auth';

export interface BroadcastLogEntry {
  id: string;
  templateContent: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: 'QUEUED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export function useBroadcast() {
  const [loading, setLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [history, setHistory] = useState<BroadcastLogEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchRecipientCount = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/broadcast/recipients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecipientCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch recipient count', err);
    }
  }, []);

  const sendBroadcast = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/broadcast/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send broadcast');
      }
      const data = await response.json();
      toast.success(`Broadcast queued for ${data.queued} recipients!`);
      await fetchHistory();
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Error sending broadcast');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const token = getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/broadcast/history?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch broadcast history', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  return { loading, recipientCount, history, historyLoading, fetchRecipientCount, sendBroadcast, fetchHistory };
}
