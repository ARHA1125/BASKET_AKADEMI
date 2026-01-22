import React from 'react';


export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type CoachStatus = 'paid' | 'processing' | 'pending' | 'PAID' | 'PROCESSING' | 'PENDING';


export const formatIDR = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};



interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  decoration?: string;
  decorationColor?: "indigo" | "emerald" | "rose" | "amber";
}

export const Card = ({ children, className = "", noPadding = false, decoration = "", decorationColor = "indigo" }: CardProps) => {
  const decorationClasses = {
    indigo: "border-t-indigo-500",
    emerald: "border-t-emerald-500",
    rose: "border-t-rose-500",
    amber: "border-t-amber-500",
  };

  return (
    <div className={`bg-white dark:bg-slate-950 rounded-lg shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden ${decoration ? `border-t-4 ${decorationClasses[decorationColor] || 'border-t-indigo-500'}` : ''} ${className}`}>
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export const Title = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-slate-900 dark:text-slate-50 font-medium text-lg ${className}`}>{children}</h3>
);

export const Text = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-slate-500 dark:text-slate-400 text-sm ${className}`}>{children}</p>
);

export const Metric = ({ children, size = "large", className = "" }: { children: React.ReactNode; size?: "large" | "medium"; className?: string }) => (
  <p className={`text-slate-900 dark:text-slate-50 font-semibold ${size === 'large' ? 'text-3xl' : 'text-xl'} ${className}`}>{children}</p>
);

export const Badge = ({ status, size = "md" }: { status: string; size?: "sm" | "md" }) => {
  /* Enhanced styles for Dark Mode compatibility */
  const styles: Record<string, string> = {
    paid: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20 dark:ring-emerald-500/20',
    PAID: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20 dark:ring-emerald-500/20',
    processing: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20',
    PROCESSING: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20 dark:ring-blue-500/20',
    pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20',
    PENDING: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-600/20 dark:ring-amber-500/20',
    overdue: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-600/20 dark:ring-rose-500/20',
    OVERDUE: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-600/20 dark:ring-rose-500/20',
    cancelled: 'bg-slate-50 dark:bg-slate-400/10 text-slate-700 dark:text-slate-400 ring-slate-600/20 dark:ring-slate-400/20',
    CANCELLED: 'bg-slate-50 dark:bg-slate-400/10 text-slate-700 dark:text-slate-400 ring-slate-600/20 dark:ring-slate-400/20',
    UNPAID: 'bg-slate-50 dark:bg-slate-400/10 text-slate-700 dark:text-slate-400 ring-slate-600/20 dark:ring-slate-400/20',
    active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20 dark:ring-emerald-500/20',
    ACTIVE: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20 dark:ring-emerald-500/20',
    inactive: 'bg-slate-50 dark:bg-slate-400/10 text-slate-500 dark:text-slate-400 ring-slate-400/20 dark:ring-slate-400/20',
    INACTIVE: 'bg-slate-50 dark:bg-slate-400/10 text-slate-500 dark:text-slate-400 ring-slate-400/20 dark:ring-slate-400/20',
  };
  
  const labels: Record<string, string> = {
    paid: 'Lunas',
    PAID: 'Lunas',
    processing: 'Proses',
    PROCESSING: 'Proses',
    pending: 'Pending',
    PENDING: 'Pending',
    overdue: 'Terlambat',
    OVERDUE: 'Terlambat',
    cancelled: 'Batal',
    CANCELLED: 'Batal',
    UNPAID: 'Belum Bayar',
    active: 'Active',
    ACTIVE: 'Active',
    inactive: 'Inactive',
    INACTIVE: 'Inactive',
  };

  const statusKey = status?.toLowerCase() || 'cancelled';

  const style = styles[status] || styles[statusKey] || styles.cancelled;
  const py = size === 'sm' ? 'py-0' : 'py-0.5';

  return (
    <span className={`inline-flex items-center rounded-md px-2 ${py} text-xs font-medium ring-1 ring-inset ${style}`}>
      {labels[status] || labels[statusKey] || status}
    </span>
  );
};

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabListProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: any) => void;
}

export const TabList = ({ tabs, activeTab, onChange }: TabListProps) => (
  <div className="flex space-x-1 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-lg w-fit mb-6 border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto max-w-full">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          activeTab === tab.id
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {tab.icon}
          {tab.label}
        </div>
      </button>
    ))}
  </div>
);
