'use client';

import { useState } from 'react';
import { TabList, Title, Text } from '@/components/ui/notifications/Common'; 
import { BookOpen, Users, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import CurriculumBuilderView from '@/components/ui/kurikulum/CurriculumBuilderView';
import CurriculumMetadataAuditView from '@/components/ui/kurikulum/CurriculumMetadataAuditView';
import CurriculumOverviewView from '@/components/ui/kurikulum/CurriculumOverviewView';

export default function KurikulumPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview & Tracking', icon: <TrendingUp size={16}/> },
    { id: 'builder', label: 'Manajemen Master Kurikulum', icon: <BookOpen size={16}/> },
    { id: 'audit', label: 'Audit Metadata FUT', icon: <ShieldCheck size={16}/> },
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
        {activeTab === 'overview' && <CurriculumOverviewView />}
        {activeTab === 'builder' && <CurriculumBuilderView />}
        {activeTab === 'audit' && <CurriculumMetadataAuditView />}
        {activeTab === 'tracking' && (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <BarChart3 size={48} className="mb-4 text-slate-300" />
                <h3 className="font-semibold text-lg">Pemantauan Akademik Global coming soon</h3>
                <p>Global academic tracking visualizations and reports will be available here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
