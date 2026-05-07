'use client';

import { useParentDataStore } from '@/hooks/use-parent-data';
import { useEffect } from 'react';
import { Users } from 'lucide-react';

export function ParentStudentSwitcher() {
  const { data, loading, activeChildIndex, setActiveChildIndex, fetchData } = useParentDataStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data || !data.children || data.children.length === 0) {
    return null;
  }

  // If there's only 1 child, we don't necessarily need a switcher, but showing the name is nice
  if (data.children.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-300">
        <Users size={16} className="text-gray-500" />
        {data.children[0].student.user.fullName}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Users size={16} className="text-gray-500 hidden sm:block" />
      <select
        value={activeChildIndex}
        onChange={(e) => setActiveChildIndex(Number(e.target.value))}
        className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:ring-blue-500"
      >
        {data.children.map((child: any, index: number) => (
          <option key={child.student.id} value={index}>
            {child.student.user.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}
