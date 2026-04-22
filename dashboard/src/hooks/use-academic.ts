import { getToken } from '@/lib/auth';
import { AttendanceRecord, Coach, Parent, PlayerAssessment, Student, StudentActivity } from '@/types/academic';
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/${resource}?${query}`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/unified/${resource}`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/${resource}/${id}`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/${resource}/${id}`, {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/students/bulk-approve`, {
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

export function useAssessment() {
    const [data, setData] = useState<PlayerAssessment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/assessments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createAssessment = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/assessments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to create assessment');
            }

            await fetchAssessments();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAssessments]);

    const updateAssessment = useCallback(async (id: string, payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/assessments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update assessment');
            await fetchAssessments();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAssessments]);

    const deleteAssessment = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/assessments/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to delete assessment');
            await fetchAssessments();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAssessments]);

    return { data, loading, fetchAssessments, createAssessment, updateAssessment, deleteAssessment };
}

export function useStudentActivities() {
    const [data, setData] = useState<StudentActivity[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchActivities = useCallback(async (studentId?: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const query = new URLSearchParams();
            if (studentId) query.set('studentId', studentId);
            const suffix = query.toString() ? `?${query.toString()}` : '';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/activities${suffix}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createActivity = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorBody = await res.json().catch(() => ({}));
                console.error('createActivity error:', res.status, errorBody);
                throw new Error(`Failed to create activity: ${res.status} ${JSON.stringify(errorBody)}`);
            }

            return res.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const awardPoints = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/gamification/points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to award points');
            }

            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateActivity = useCallback(async (id: string, payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/activities/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to update activity');
            }

            await fetchActivities();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchActivities]);

    const deleteActivity = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/activities/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Failed to delete activity');
            }

            await fetchActivities();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchActivities]);

    const fetchWeeklyLeaderboard = useCallback(async (ageClass?: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const query = new URLSearchParams();
            if (ageClass) query.set('ageClass', ageClass);
            const suffix = query.toString() ? `?${query.toString()}` : '';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/gamification/leaderboard/weekly${suffix}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                return res.json();
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, fetchActivities, createActivity, updateActivity, deleteActivity, awardPoints, fetchWeeklyLeaderboard };
}

export function useAttendance() {
    const [data, setData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/attendance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const createAttendance = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to create attendance');
            }

            await fetchAttendance();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAttendance]);

    const fetchAttendanceSummary = useCallback(async (ageClass?: string) => {
        setLoading(true);
        try {
            const token = getToken();
            const query = new URLSearchParams();
            if (ageClass) query.set('ageClass', ageClass);
            const suffix = query.toString() ? `?${query.toString()}` : '';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/attendance/reports/summary${suffix}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                return res.json();
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, fetchAttendance, createAttendance, fetchAttendanceSummary };
}

export function useCommunity() {
    const [loading, setLoading] = useState(false);

    const createEvent = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/community-module/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to create event');
            return res.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/community-module/events`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) return res.json();
            return [];
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createSquad = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/community-module/squads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to create squad');
            return res.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSquads = useCallback(async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/community-module/squads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) return res.json();
            return [];
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const finalizeSquad = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/community-module/squads/finalize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to finalize squad');
            return res.json();
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, createEvent, fetchEvents, createSquad, fetchSquads, finalizeSquad };
}
