'use client';

import CoachView from '@/components/ui/admin/CoachView';
import ParentView from '@/components/ui/admin/ParentView';
import StudentView from '@/components/ui/admin/StudentView';
import { TabList, Text, Title } from '@/components/ui/notifications/Common';
import {
    GraduationCap,
    Users,
    UserSquare2
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MembersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTabState] = useState(tabParam || 'students');

  useEffect(() => {
    if (tabParam) {
      setActiveTabState(tabParam);
    }
  }, [tabParam]);

  const setActiveTab = (id: string) => {
    setActiveTabState(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { id: 'students', label: 'Students', icon: <GraduationCap size={16}/> },
    { id: 'parents', label: 'Parents', icon: <Users size={16}/> },
    { id: 'coaches', label: 'Coaches', icon: <UserSquare2 size={16}/> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Title className="text-2xl font-bold text-slate-900 dark:text-white">Member Management</Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">Manage all students, parents, and coaches in the academy.</Text>
      </div>

      {/* Tabs */}
      <TabList tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'students' && <StudentView />}
        {activeTab === 'parents' && <ParentView />}
        {activeTab === 'coaches' && <CoachView />}
      </div>
    </div>
  );
}
