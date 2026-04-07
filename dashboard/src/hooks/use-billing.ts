import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { Invoice } from '../types/invoices';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useBilling(activeTab: 'current' | 'history', selectedMonth?: number, selectedYear?: number) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [scheduleDay, setScheduleDay] = useState(1);
    const [scheduleTime, setScheduleTime] = useState('00:00');
    const [reminderScheduleDay, setReminderScheduleDay] = useState(1);
    const [reminderScheduleTime, setReminderScheduleTime] = useState('00:00');

    useEffect(() => {
        fetchInvoices();
        fetchSchedule();
        fetchReminderSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, selectedMonth, selectedYear]);

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
            let url = `${API_URL}/payment-module/invoices?filter=${activeTab}`;
            if (selectedMonth && selectedYear) {
                url += `&month=${selectedMonth}&year=${selectedYear}`;
            }
            
            const res = await fetch(url, {
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

    const fetchReminderSchedule = async () => {
        try {
            const res = await fetch(`${API_URL}/payment-module/reminder-schedule`, {
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                 const text = await res.text();
                 throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
            }

            const data = await res.json();
            setReminderScheduleDay(data.day);
            setReminderScheduleTime(data.time || '00:00');
        } catch (error) {
            console.error("Failed to fetch reminder schedule", error);
        }
    };

    const saveReminderSchedule = async (newDay: number, newTime: string) => {
        try {
            const res = await fetch(`${API_URL}/payment-module/reminder-schedule`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ day: newDay, time: newTime })
            });

            if (!res.ok) {
                 const text = await res.text();
                 throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
            }

            setReminderScheduleDay(newDay);
            setReminderScheduleTime(newTime);
        } catch (error) {
            console.error("Failed to save reminder schedule", error);
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
             
            
             setInvoices(prev => prev.filter(inv => inv.id !== id));
        } catch (error) {
            console.error("Failed to delete invoice", error);
            throw error;
        }
    };

    const deleteAllInvoices = async () => {
        try {
            const res = await fetch(`${API_URL}/payment-module/invoices/all?filter=${activeTab}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                 const text = await res.text();
                 throw new Error(`Error ${res.status}: ${res.statusText} - ${text}`);
            }

            // Immediately refresh list
            fetchInvoices();
            return await res.json();
        } catch (error) {
            console.error("Failed to delete all invoices", error);
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
        reminderScheduleDay,
        reminderScheduleTime,
        saveSchedule,
        saveReminderSchedule,
        manualGenerate,
        deleteInvoice,
        deleteAllInvoices,
        sendManualReminders,
        refreshInvoices: fetchInvoices
    };
}
