import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Invoice } from '../types/invoices';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useInvoice(id: string) {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchInvoice(id);
        }
    }, [id]);

    const fetchInvoice = async (invoiceId: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/payment-module/${invoiceId}`, {
                headers
            });

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('Invoice not found');
                }
                throw new Error('Failed to fetch invoice');
            }

            const data = await res.json();
            setInvoice(data);
        } catch (err: any) {
            console.error("Error fetching invoice:", err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { invoice, loading, error, refresh: () => fetchInvoice(id) };
}
