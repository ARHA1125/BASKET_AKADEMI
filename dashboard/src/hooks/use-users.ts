import { getToken } from '@/lib/auth';
import { User } from '@/types/user-profile';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
export type { User };

export function useUsers() {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async (page: number, search: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const query = new URLSearchParams({ page: page.toString(), limit: '10', search });
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
                setTotal(json.total);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = async (id: string, payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) throw new Error('Failed');
            
            await fetchData(1, '');
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const uploadPhoto = async (id: string, file: File, role: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append('file', file);

            
            let type = 'student';
            if (role === 'PARENT') type = 'parent';
            if (role === 'COACH') type = 'coach';

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${id}/photo?type=${type}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            
            toast.success("Photo uploaded successfully");
            await fetchData(1, ''); 
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload photo");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        total,
        fetchData,
        updateUser,
        uploadPhoto
    };
}
