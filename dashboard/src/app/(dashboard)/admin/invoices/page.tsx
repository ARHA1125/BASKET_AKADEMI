'use client';

import { InvoiceStatusBadge } from '@/components/ui/admin/InvoiceStatusBadge';
import { ProofViewerModal } from '@/components/ui/admin/ProofViewerModal';
import { CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface Invoice {
  id: string;
  student: string;
  category: string;
  date: string;
  amount: number;
  status: string;
  method: string;
  photoUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'unpaid'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/payment-module/invoices?filter=current`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Gagal memuat data invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (invoiceId: string) => {
    try {
      const adminId = localStorage.getItem('userId') || 'admin';
      const response = await fetch(`${API_URL}/payment-module/verify/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ adminId }),
      });

      if (response.ok) {
        toast.success('Pembayaran berhasil diverifikasi!');
        await fetchInvoices();
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Gagal memverifikasi pembayaran');
    }
  };

  const handleViewProof = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'pending':
        return inv.photoUrl && !inv.isVerified;
      case 'verified':
        return inv.isVerified;
      case 'unpaid':
        return !inv.photoUrl;
      default:
        return true;
    }
  });

  const stats = {
    total: invoices.length,
    pending: invoices.filter(inv => inv.photoUrl && !inv.isVerified).length,
    verified: invoices.filter(inv => inv.isVerified).length,
    unpaid: invoices.filter(inv => !inv.photoUrl).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-500">Memuat data invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoice Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kelola dan verifikasi pembayaran invoice</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Invoice</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Menunggu Verifikasi</p>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Terverifikasi</p>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">{stats.verified}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl border border-slate-300 dark:border-slate-600">
          <p className="text-sm text-slate-600 dark:text-slate-400">Belum Bayar</p>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">{stats.unpaid}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari invoice atau nama siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'verified'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unpaid'
                ? 'bg-slate-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Invoice ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Siswa</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Jumlah</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Bukti</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada invoice ditemukan
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">{invoice.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{invoice.student}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(invoice.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(invoice.amount)}</td>
                    <td className="px-6 py-4">
                      {invoice.photoUrl ? (
                        <CheckCircle className="text-emerald-500" size={20} />
                      ) : (
                        <XCircle className="text-slate-300" size={20} />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusBadge invoice={invoice} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {invoice.photoUrl && (
                          <>
                            <button
                              onClick={() => handleViewProof(invoice)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                              title="View Proof"
                            >
                              <Eye size={18} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            {!invoice.isVerified && (
                              <button
                                onClick={() => handleVerify(invoice.id)}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                title="Verify Payment"
                              >
                                <CheckCircle size={16} />
                                Verify
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Viewer Modal */}
      {selectedInvoice && (
        <ProofViewerModal
          invoice={selectedInvoice}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onVerify={handleVerify}
          apiUrl={API_URL}
        />
      )}
    </div>
  );
}
