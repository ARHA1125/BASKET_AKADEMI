import { getToken } from '@/lib/auth';
import { Coach, Parent, Student } from '@/types/academic';
import { PaginatedResponse } from '@/types/common';
import { useCallback, useState } from 'react';

export function useAcademic<T>(resource: 'students' | 'parents' | 'coaches') {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async (page: number, search: string, limit: number = 10) => {
        setLoading(true);
        try {
            const token = getToken();
            const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/academic/${resource}?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json: PaginatedResponse<T> = await res.json();
                setData(json.data);
                setTotal(json.total);
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
            
            // Refresh list
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
        fetchData,
        createUnified,
        updateResource,
        deleteResource
    };
}

export function useStudents() {
    const { data, ...rest } = useAcademic<Student>('students');
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending'>('all');

    // Client-side filtering
    const filteredData = data.filter(student => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return student.user.status === 'Active';
        if (activeTab === 'pending') return student.user.status === 'Pending';
        return true;
    });

    const stats = {
        pending: data.filter(s => s.user.status === 'Pending').length,
        active: data.filter(s => s.user.status === 'Active' || !s.user.status).length,
        total: data.length
    };

    return { 
        data: filteredData, 
        allData: data,
        activeTab, 
        setActiveTab, 
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
