'use client';

import AutomationsView from '@/components/ui/notifications/AutomationsView';
import BillingView from '@/components/ui/notifications/BillingView';
import { TabList, Text, Title } from '@/components/ui/notifications/Common';
import OverviewView from '@/components/ui/notifications/OverviewView';
import PayrollView from '@/components/ui/notifications/PayrollView';
import {
  Banknote,
  BarChart3,
  Bot,
  Receipt
} from 'lucide-react';
import { useState } from 'react';

export default function FinancialHubPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16}/> },
    { id: 'billing', label: 'Billing & Invoices', icon: <Receipt size={16}/> },
    { id: 'payroll', label: 'Coach Payroll', icon: <Banknote size={16}/> },
    { id: 'automation', label: 'Automations', icon: <Bot size={16}/> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
  
      <div>
        <Title className="text-2xl font-bold text-slate-900 dark:text-white">Financial Hub</Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">Manage invoices, payroll, and automations in one place.</Text>
      </div>


      <TabList tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      
      <div className="min-h-[500px]">
        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'billing' && <BillingView />}
        {activeTab === 'payroll' && <PayrollView />}
        {activeTab === 'automation' && <AutomationsView />}
      </div>
    </div>
  );
}
