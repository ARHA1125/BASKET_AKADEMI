'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getToken } from '@/lib/auth';
import { Card, Title, Text, Metric, Badge, TabList, formatIDR } from '@/components/ui/notifications/Common';
import { PaymentCard } from '@/components/ui/invoice/PaymentCard';
import { UniqueAmountDisplay } from '@/utils/formatUniqueAmount';
import { Banknote, CreditCard, Eye, Wallet, CheckCircle2, AlertCircle, Calendar, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type Invoice = {
  id: string;
  student: string;
  category: string;
  date: string;
  amount: number;
  uniqueCode?: number;
  uniqueAmount: number;
  paymentMethod?: 'TRANSFER' | 'CASH';
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  method: string;
  photoUrl?: string;
  buktiTimeStamp?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  dueDate?: string;
};

export function ParentFinancialsView() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'unpaid' | 'history'>('unpaid');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const query = new URLSearchParams();
      if (selectedMonth) query.append('month', String(selectedMonth));
      if (selectedYear) query.append('year', String(selectedYear));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/payment-module/parent/me?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error('Gagal memuat data tagihan');
      }

      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data tagihan');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Calculate statistics
  const stats = useMemo(() => {
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue');
    const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.uniqueAmount || inv.amount), 0);
    const paidInvoicesCount = invoices.filter(inv => inv.status === 'paid').length;

    return {
      outstandingAmount: totalOutstanding,
      outstandingCount: unpaidInvoices.length,
      paidCount: paidInvoicesCount,
    };
  }, [invoices]);

  // Filter invoices for current active tab
  const filteredInvoices = useMemo(() => {
    if (activeTab === 'unpaid') {
      return invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'overdue' || (inv.photoUrl && !inv.isVerified));
    } else {
      return invoices.filter(inv => inv.status === 'paid' || inv.status === 'cancelled');
    }
  }, [invoices, activeTab]);

  const handleResetFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tagihan & Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola tagihan SPP bulanan anak Anda, unduh rincian, dan konfirmasi bukti pembayaran.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card decoration="amber" decorationColor="amber">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-xs font-semibold uppercase tracking-wider text-amber-500">Total Belum Bayar</Text>
              <Metric className="mt-2 text-amber-600 dark:text-amber-400">
                {formatIDR(stats.outstandingAmount)}
              </Metric>
              <Text className="mt-1 text-slate-500 dark:text-slate-400">
                Dari {stats.outstandingCount} tagihan aktif
              </Text>
            </div>
            <div className="rounded-full bg-amber-50 dark:bg-amber-900/20 p-3 text-amber-600">
              <Wallet size={24} />
            </div>
          </div>
        </Card>

        <Card decoration="emerald" decorationColor="emerald">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Pembayaran Selesai</Text>
              <Metric className="mt-2 text-emerald-600 dark:text-emerald-400">
                {stats.paidCount} Tagihan
              </Metric>
              <Text className="mt-1 text-slate-500 dark:text-slate-400">
                Telah terverifikasi oleh admin
              </Text>
            </div>
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 p-3 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Tab Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Navigation Tabs */}
        <TabList
          tabs={[
            { id: 'unpaid', label: `Belum Lunas (${stats.outstandingCount})`, icon: <Wallet size={16} /> },
            { id: 'history', label: `Riwayat Pembayaran`, icon: <CheckCircle2 size={16} /> },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as 'unpaid' | 'history')}
        />

        {/* Month/Year Calendar Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : '')}
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            <option value="">Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
            className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          >
            <option value="">Semua Tahun</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {(selectedMonth || selectedYear) && (
            <button
              onClick={handleResetFilters}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Reset
            </button>
          )}

          <button
            onClick={fetchInvoices}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <Card noPadding>
        <div className="min-h-[300px] overflow-x-auto">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">
              <RefreshCw className="mr-2 animate-spin" /> Memuat data tagihan...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <AlertCircle size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium">Tidak ada tagihan pada periode ini.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="hidden md:table w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Nama Siswa</th>
                    <th className="px-6 py-3">Periode</th>
                    <th className="px-6 py-3">Batas Waktu</th>
                    <th className="px-6 py-3">Nominal</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {inv.student}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(inv.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <UniqueAmountDisplay baseAmount={inv.amount} uniqueCode={inv.uniqueCode} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={inv.photoUrl && !inv.isVerified ? 'pending' : inv.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.status !== 'paid' && inv.status !== 'cancelled' ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowPaymentModal(true);
                            }}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                          >
                            {inv.photoUrl ? 'Upload Ulang Bukti' : 'Bayar Sekarang'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowPaymentModal(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            <Eye size={14} /> Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card Grid View */}
              <div className="md:hidden grid gap-4 p-4">
                {filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-950 dark:text-slate-50">{inv.student}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Periode: {new Date(inv.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <Badge status={inv.photoUrl && !inv.isVerified ? 'pending' : inv.status} />
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Nominal Tagihan</div>
                        <UniqueAmountDisplay baseAmount={inv.amount} uniqueCode={inv.uniqueCode} size="sm" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide text-right">Jatuh Tempo</div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {inv.status !== 'paid' && inv.status !== 'cancelled' ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowPaymentModal(true);
                          }}
                          className="w-full text-center rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
                        >
                          {inv.photoUrl ? 'Upload Ulang Bukti' : 'Bayar Sekarang'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowPaymentModal(true);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <Eye size={14} /> Lihat Detail Tagihan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Payment Proof/Rincian Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-850 dark:bg-slate-900 max-h-[90vh] overflow-y-auto duration-200">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rincian Tagihan</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  fetchInvoices(); // Refetch to update list with verification status
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="mb-6 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-4 text-sm border border-slate-200/50 dark:border-slate-850">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">ID Tagihan</span>
                <a
                  href={`/invoice/${selectedInvoice.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  #{selectedInvoice.id.substring(0, 8)}...
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Siswa</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedInvoice.student}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Periode Tagihan</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(selectedInvoice.date).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Jatuh Tempo</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Total Pembayaran</span>
                <UniqueAmountDisplay baseAmount={selectedInvoice.amount} uniqueCode={selectedInvoice.uniqueCode} size="md" />
              </div>
            </div>

            {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' ? (
              <PaymentCard
                invoiceId={selectedInvoice.id}
                existingProofUrl={selectedInvoice.photoUrl}
              />
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-800/30 flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Tagihan Telah Lunas</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Pembayaran Anda telah diverifikasi oleh admin. Terima kasih.
                    </p>
                  </div>
                </div>

                {selectedInvoice.photoUrl && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Bukti Pembayaran:</p>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/${selectedInvoice.photoUrl}`}
                        alt="Bukti Transfer"
                        className="max-h-60 object-contain rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
