import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getToken } from '@/lib/auth';

export function useBroadcast() {
  const [loading, setLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number>(0);

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
      return data;
    } catch (err: any) {
      toast.error(err.message || 'Error sending broadcast');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, recipientCount, fetchRecipientCount, sendBroadcast };
}
