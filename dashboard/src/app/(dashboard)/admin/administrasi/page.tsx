'use client';

import { useState } from 'react';
import { TabList, Title, Text } from '@/components/ui/notifications/Common'; // Reusing common components
import SponsorsView from '@/components/ui/administrasi/SponsorsView';
import { Calendar, FileText, Megaphone } from 'lucide-react';

export default function AdministrasiPage() {
  const [activeTab, setActiveTab] = useState('sponsors');

  const tabs = [
    { id: 'sponsors', label: 'Sponsors', icon: <Megaphone size={16}/> },
    { id: 'events', label: 'Events', icon: <Calendar size={16}/> },
    { id: 'news', label: 'News', icon: <FileText size={16}/> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Title className="text-2xl font-bold text-slate-900 dark:text-white">Administration</Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">Manage academy sponsors, events, and news.</Text>
      </div>

      <TabList tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="min-h-[500px]">
        {activeTab === 'sponsors' && <SponsorsView />}
        {activeTab === 'events' && (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Calendar size={48} className="mb-4 text-slate-300" />
                <h3 className="font-semibold text-lg">Events module coming soon</h3>
                <p>This feature is not yet implemented.</p>
            </div>
        )}
        {activeTab === 'news' && (
             <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <FileText size={48} className="mb-4 text-slate-300" />
                <h3 className="font-semibold text-lg">News module coming soon</h3>
                 <p>This feature is not yet implemented.</p>
            </div>
        )}
      </div>
    </div>
  );
}
