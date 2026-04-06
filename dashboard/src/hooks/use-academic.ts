import { getToken } from '@/lib/auth';
import { Coach, Parent, Student } from '@/types/academic';
import { PaginatedResponse, PaginatedResponseStats } from '@/types/common';
import { useCallback, useState } from 'react';

export function useAcademic<T>(resource: 'students' | 'parents' | 'coaches') {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState<PaginatedResponseStats | null>(null);

    const fetchData = useCallback(async (
        page: number,
        search: string,
        limit: number = 10,
        extraParams: Record<string, string | number | boolean | undefined> = {}
    ) => {
        setLoading(true);
        try {
            const token = getToken();
            const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search });
            for (const [key, value] of Object.entries(extraParams)) {
                if (value !== undefined) {
                    query.set(key, String(value));
                }
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/academic/${resource}?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json: PaginatedResponse<T> = await res.json();
                setData(json.data);
                setTotal(json.total);
                setStats(json.stats ?? null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [resource]);

    const createUnified = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/academic/unified/${resource}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('Unified Create Error:', errorData);
                throw new Error(errorData.message || 'Failed to create resource');
            }
            
           
            await fetchData(1, '');
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [resource, fetchData]);

    const updateResource = useCallback(async (id: string, payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/academic/${resource}/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) {
                throw new Error('Failed to update resource');
            }
            
            await fetchData(1, '');
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [resource, fetchData]);

    const deleteResource = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/academic/${resource}/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error('Failed to delete resource');
            }
            
            await fetchData(1, '');
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [resource, fetchData]);

    return {
        data,
        loading,
        total,
        stats,
        fetchData,
        createUnified,
        updateResource,
        deleteResource
    };
}

export function useStudents() {
    const { data, stats: apiStats, total, ...rest } = useAcademic<Student>('students');
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending'>('all');
    const [bulkApproving, setBulkApproving] = useState(false);

    const bulkApprovePending = useCallback(async (search: string = '') => {
        try {
            setBulkApproving(true);
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/academic/students/bulk-approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ search })
            });

            if (!res.ok) {
                throw new Error('Failed to bulk approve students');
            }

            const json: { updated: number } = await res.json();
            return json;
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setBulkApproving(false);
        }
    }, []);

    
    const filteredData = data.filter(student => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return student.user.status === 'Active';
        if (activeTab === 'pending') return student.user.status === 'Pending';
        return true;
    });

    const stats = {
        pending: apiStats?.pending ?? 0,
        active: apiStats?.active ?? 0,
        total: apiStats?.total ?? total
    };

    return { 
        data: filteredData, 
        allData: data,
        activeTab, 
        setActiveTab, 
        bulkApproving,
        bulkApprovePending,
        total,
        stats,
        ...rest 
    };
}

export function useParents() {
    return useAcademic<Parent>('parents');
}

export function useCoaches() {
    return useAcademic<Coach>('coaches');
}
