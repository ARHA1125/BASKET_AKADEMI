import { create } from 'zustand';
import { getToken } from '@/lib/auth';

type ParentSummaryResponse = any;

interface ParentDataStore {
  data: ParentSummaryResponse | null;
  loading: boolean;
  error: Error | null;
  activeChildIndex: number;
  setActiveChildIndex: (index: number) => void;
  fetchData: () => Promise<void>;
}

export const useParentDataStore = create<ParentDataStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  activeChildIndex: 0,
  setActiveChildIndex: (index) => set({ activeChildIndex: index }),
  fetchData: async () => {
    if (get().loading || get().data) return; // Prevent double fetch
    
    set({ loading: true, error: null });
    try {
      const token = getToken();
      if (!token) throw new Error('No token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/academic/me/children/performance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load parent data');
      }

      const data = await res.json();
      set({ data, loading: false });
    } catch (error) {
      console.error(error);
      set({ error: error as Error, loading: false });
    }
  },
}));
