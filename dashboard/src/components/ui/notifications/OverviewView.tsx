import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Card, Metric, Text, Title, formatIDR } from './Common';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OverviewData {
    totalRevenue: number;
    targetRevenue: number;
    revenueGrowth: number;
    agingAR: number;
    agingStudents: number;
    overdueAmount: number;
    netProfit: number;
    grossMargin: number;
    cashFlow: { month: string, income: number, expense: number }[];
    recentTransactions: { id: string, title: string, date: string, amount: number, type: 'income' | 'expense' }[];
}

export default function OverviewView() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchOverviewData = async () => {
         try {
             const token = getToken();
             const res = await fetch(`${API_URL}/payment-module/overview`, {
                 headers: {
                     'Authorization': `Bearer ${token}`
                 }
             });
             if (res.ok) {
                 const result = await res.json();
                 setData(result);
             }
         } catch (error) {
             console.error("Failed to fetch overview data", error);
         } finally {
             setLoading(false);
         }
     };
     
     fetchOverviewData();
  }, []);

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[400px] text-slate-500">
              <Loader2 className="animate-spin mr-2" /> Memuat data ulasan...
          </div>
      );
  }

  if (!data) {
      return (
          <div className="flex items-center justify-center min-h-[400px] text-rose-500">
              Gagal memuat data.
          </div>
      );
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card decoration="indigo" decorationColor="indigo">
          <Text>Total Revenue (Bulan Ini)</Text>
          <div className="flex items-end gap-3 mt-2">
             <Metric>{formatIDR(data.totalRevenue)}</Metric>
             <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mb-1 border ${data.revenueGrowth >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
               {data.revenueGrowth >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} 
               {data.revenueGrowth > 0 ? '+' : ''}{data.revenueGrowth}%
             </span>
          </div>
          <Text className="mt-2 text-xs">Target: {formatIDR(data.targetRevenue)}</Text>
        </Card>

        <Card decoration="rose" decorationColor="rose">
          <div className="flex items-start justify-between">
             <Text>Aging AR (Belum Lunas)</Text>
             <AlertCircle size={16} className="text-rose-500 opacity-60"/>
          </div>
          <div className="flex items-end gap-3 mt-2">
             <Metric>{formatIDR(data.agingAR)}</Metric>
             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 mb-1 border border-rose-100">
               {data.agingStudents} Siswa
             </span>
          </div>
          <Text className="mt-2 text-xs">Jatuh Tempo &gt; 30 hari: {formatIDR(data.overdueAmount)}</Text>
        </Card>

        {/* <Card decoration={data.netProfit >= 0 ? "emerald" : "rose"} decorationColor={data.netProfit >= 0 ? "emerald" : "rose"}>
          <Text>Estimasi Laba Bersih</Text>
          <div className="flex items-end gap-3 mt-2">
             <Metric>{formatIDR(data.netProfit)}</Metric>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
             <div className={`${data.netProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} h-1.5 rounded-full`} style={{ width: `${Math.min(100, Math.max(0, Math.abs(data.grossMargin)))}%` }}></div>
          </div>
          <div className="flex justify-between mt-2">
             <Text className="text-xs">Margin Kotor</Text>
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.grossMargin}%</span>
          </div>
        </Card> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
              <div>
                <Title>Tren Arus Kas</Title>
                <Text>Invoice terbayar dan tidak terbayarkan</Text>
              </div>
              <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sudah Bayar</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-indigo-100 dark:bg-indigo-900"></span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Belum Bayar</span>
                  </div>
              </div>
          </div>
          

          <div className="h-72 flex items-end justify-between gap-2 sm:gap-4 mt-4">
            {data.cashFlow.map((item, idx) => {
               // Defensive check to avoid dividing by zero if target is 0
               const maxScale = Math.max(data.targetRevenue, ...data.cashFlow.map(c => Math.max(c.income, c.expense)), 1); 

               return (
                  <div key={idx} className="w-full flex flex-col items-center gap-2 group relative">

                     <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-xs p-2 rounded pointer-events-none z-10 whitespace-nowrap shadow-lg">
                        <p>In: {formatIDR(item.income)}</p>
                        <p className="opacity-80">Out: {formatIDR(item.expense)}</p>
                     </div>
                     
                     <div className="w-full h-64 flex gap-1 items-end justify-center">
                        <div style={{ height: `${(item.income / maxScale) * 100}%` }} className="w-full max-w-[24px] bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-600"></div>
                        <div style={{ height: `${(item.expense / maxScale) * 100}%` }} className="w-full max-w-[24px] bg-indigo-100 dark:bg-indigo-900 rounded-t-sm transition-all duration-300 hover:bg-indigo-200 dark:hover:bg-indigo-800"></div>
                     </div>
                     <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.month}</span>
                  </div>
               );
            })}
          </div>
        </Card>


        <Card>
          <Title className="mb-4">Transaksi Terkini</Title>
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
            {data.recentTransactions.length === 0 ? (
               <div className="text-center text-slate-500 py-4 text-sm">Belum ada transaksi</div>
            ) : data.recentTransactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${tx.type === 'expense' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {tx.type === 'expense' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                   </div>
                   <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{tx.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tx.date}</p>
                   </div>
                </div>
                <span className={`text-sm font-medium ${tx.type === 'expense' ? 'text-slate-900 dark:text-slate-50' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatIDR(tx.amount)}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
            Lihat Semua Transaksi
          </button>
        </Card>
      </div>
    </div>
  );
}
