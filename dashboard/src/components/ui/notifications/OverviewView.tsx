import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    X,
    Download,
    Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/Dialog';
import { Card, Metric, Text, Title, formatIDR } from './Common';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';
import type { Invoice } from '@/types/invoices';

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
    selectedMonth?: number;
    selectedYear?: number;
    selectedMonthLabel?: string;
}

export default function OverviewView() {
  const today = new Date();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Invoice[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const selectedMonthLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
      const fetchOverviewData = async () => {
          setLoading(true);
          try {
              const token = getToken();
              const query = new URLSearchParams({
                month: String(selectedMonth),
                year: String(selectedYear),
              });

              const res = await fetch(`${API_URL}/payment-module/overview?${query.toString()}`, {
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
   }, [selectedMonth, selectedYear]);

   const handleDownload = async () => {
      try {
          setDownloading(true);
          const token = getToken();
          const query = new URLSearchParams({
            month: String(selectedMonth),
            year: String(selectedYear),
          });

          const response = await fetch(`${API_URL}/payment-module/reports/monthly?${query.toString()}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Gagal mengunduh laporan bulanan');
          }

          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          const contentDisposition = response.headers.get('Content-Disposition');
          const fileNameMatch = contentDisposition?.match(/filename="?([^\"]+)"?/i);
          anchor.href = downloadUrl;
          anchor.download = fileNameMatch?.[1] || `monthly-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.xlsx`;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(downloadUrl);
      } catch (error) {
          console.error('Failed to download monthly report', error);
      } finally {
          setDownloading(false);
       }
    };

   const handleOpenTransactions = async () => {
      try {
          setTransactionsLoading(true);
          setTransactionsOpen(true);
          const token = getToken();
          const query = new URLSearchParams({
            filter: 'history',
            month: String(selectedMonth),
            year: String(selectedYear),
          });

          const response = await fetch(`${API_URL}/payment-module/invoices?${query.toString()}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Gagal memuat semua transaksi');
          }

          const result = await response.json();
          setAllTransactions(Array.isArray(result) ? result : []);
      } catch (error) {
          console.error('Failed to fetch all monthly transactions', error);
          setAllTransactions([]);
      } finally {
          setTransactionsLoading(false);
      }
   };

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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Title>Ringkasan {data.selectedMonthLabel || selectedMonthLabel}</Title>
          <Text>Laporan overview dan unduhan Excel tersedia untuk setiap bulan.</Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(Number(event.target.value))}
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((monthValue) => (
              <option key={monthValue} value={monthValue}>
                {new Date(0, monthValue - 1).toLocaleString('id-ID', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            {Array.from({ length: 5 }, (_, index) => today.getFullYear() - index).map((yearValue) => (
              <option key={yearValue} value={yearValue}>
                {yearValue}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Unduh Report Bulanan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card decoration="indigo" decorationColor="indigo">
          <Text>Total Revenue ({data.selectedMonthLabel || selectedMonthLabel})</Text>
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
             <Text>Aging AR ({data.selectedMonthLabel || selectedMonthLabel})</Text>
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
                 <Text>6 bulan terakhir hingga {data.selectedMonthLabel || selectedMonthLabel}</Text>
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
          <Title className="mb-1">Transaksi Terkini</Title>
          <Text className="mb-4">Riwayat pembayaran untuk {data.selectedMonthLabel || selectedMonthLabel}</Text>
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
          <button
            type="button"
            onClick={handleOpenTransactions}
            className="w-full mt-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          >
            Lihat Semua Transaksi
          </button>
        </Card>
      </div>

      <Dialog open={transactionsOpen} onOpenChange={setTransactionsOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle>Semua Transaksi Invoice</DialogTitle>
                <DialogDescription>
                  Daftar seluruh transaksi invoice untuk {data.selectedMonthLabel || selectedMonthLabel}.
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto px-6 py-4">
            {transactionsLoading ? (
              <div className="flex min-h-40 items-center justify-center text-slate-500">
                <Loader2 className="mr-2 animate-spin" size={18} /> Memuat transaksi...
              </div>
            ) : allTransactions.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">
                Belum ada transaksi invoice untuk bulan ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Invoice ID</th>
                      <th className="px-4 py-3 font-medium">Siswa</th>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 font-medium">Jumlah</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {allTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{transaction.id}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{transaction.student}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{transaction.date}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                          {formatIDR(transaction.uniqueAmount || transaction.amount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            transaction.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                              : transaction.status === 'overdue'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
