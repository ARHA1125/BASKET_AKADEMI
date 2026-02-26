'use client';

import { useState } from 'react';
import { TabList, Title, Text } from '@/components/ui/notifications/Common'; 
import { BookOpen, Users, BarChart3 } from 'lucide-react';
import CurriculumBuilderView from '@/components/ui/kurikulum/CurriculumBuilderView';

export default function KurikulumPage() {
  const [activeTab, setActiveTab] = useState('builder');

  const tabs = [
    { id: 'builder', label: 'Manajemen Master Kurikulum', icon: <BookOpen size={16}/> },
    { id: 'plotting', label: 'Manajemen Kelas & Plotting', icon: <Users size={16}/> },
    { id: 'tracking', label: 'Pemantauan Akademik Global', icon: <BarChart3 size={16}/> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Title className="text-2xl font-bold text-slate-900 dark:text-white">Kurikulum & Akademi</Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">Manage academy curriculum structured levels, class plotting, and academic tracking.</Text>
      </div>

      <TabList tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="min-h-[500px]">
        {activeTab === 'builder' && <CurriculumBuilderView />}
        {activeTab === 'plotting' && (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Users size={48} className="mb-4 text-slate-300" />
                <h3 className="font-semibold text-lg">Class Plotting module coming soon</h3>
                <p>This feature will allow plotting students and coaches to specific classes/levels.</p>
            </div>
        )}
        {activeTab === 'tracking' && (
             <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <BarChart3 size={48} className="mb-4 text-slate-300" />
                <h3 className="font-semibold text-lg">Academic Tracking module coming soon</h3>
                 <p>This feature will show global academic statistics and coach discipline.</p>
            </div>
        )}
      </div>
    </div>
  );
}
