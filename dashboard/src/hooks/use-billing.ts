import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Invoice } from '../types/invoices';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useBilling(activeTab: 'current' | 'history') {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [scheduleDay, setScheduleDay] = useState(1);
    const [scheduleTime, setScheduleTime] = useState('00:00');

    useEffect(() => {
        fetchInvoices();
        fetchSchedule();
    }, [activeTab]);

    const getAuthHeaders = () => {
        const token = getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/payment-module/invoices?filter=${activeTab}`, {
                headers: getAuthHeaders()
            });
            
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
            }
            
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async () => {
        try {
            const res = await fetch(`${API_URL}/payment-module/schedule`, {
                headers: getAuthHeaders()
            });
            
            if (!res.ok) {
                 const text = await res.text();
                 throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
            }

            const data = await res.json();
            setScheduleDay(data.day);
            setScheduleTime(data.time || '00:00');
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
    };

    const saveSchedule = async (newDay: number, newTime: string) => {
        try {
            const res = await fetch(`${API_URL}/payment-module/schedule`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ day: newDay, time: newTime })
            });

            if (!res.ok) {
                 const text = await res.text();
                 throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
            }

            setScheduleDay(newDay);
            setScheduleTime(newTime);
        } catch (error) {
            console.error("Failed to save schedule", error);
        }
    };

    const manualGenerate = async () => {
        try {
            const res = await fetch(`${API_URL}/payment-module/generate-now`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                 const text = await res.text();
                 throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
            }
            
            // Refresh list
            fetchInvoices();
        } catch (error) {
            console.error("Failed to manual generate", error);
            throw error;
        }
    };

    const deleteInvoice = async (id: string) => {
        try {
             const res = await fetch(`${API_URL}/payment-module/${id}`, {
                 method: 'DELETE',
                 headers: getAuthHeaders()
             });

             if (!res.ok) throw new Error("Failed to delete");
             
             // Refresh
             setInvoices(prev => prev.filter(inv => inv.id !== id));
        } catch (error) {
            console.error("Failed to delete invoice", error);
            throw error;
        }
    };

    const sendManualReminders = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications/invoices/send-manual`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            return await res.json();
        } catch (error) {
            console.error("Failed to send reminders", error);
            throw error;
        }
    };

    return {
        invoices,
        loading,
        scheduleDay,
        scheduleTime,
        saveSchedule,
        manualGenerate,
        deleteInvoice,
        sendManualReminders,
        refreshInvoices: fetchInvoices
    };
}
