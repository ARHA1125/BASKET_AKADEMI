import { InvoiceStatusBadge } from '@/components/ui/admin/InvoiceStatusBadge';
import { ProofViewerModal } from '@/components/ui/admin/ProofViewerModal';
import { SwipeableVerificationModal } from '@/components/ui/admin/SwipeableVerificationModal';
import { useBilling } from '@/hooks/use-billing';
import { UniqueAmountDisplay } from '@/utils/formatUniqueAmount';
import Cookies from 'js-cookie';
import {
    Banknote,
    CheckCircle,
    CreditCard,
    Eye,
    Filter,
    Loader2,
    MoreHorizontal,
    Search,
    Trash2,
    XCircle,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Badge, Card, formatIDR, Title } from './Common';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/DropdownMenu';

export default function BillingView() {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [swipeableModalOpen, setSwipeableModalOpen] = useState(false);
  const [verificationStartIndex, setVerificationStartIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'pending' | 'verified'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');

  useEffect(() => {
    setMounted(true);
  }, []);
  

  const { 
    invoices, loading, scheduleDay, scheduleTime, saveSchedule, 
    reminderScheduleDay, reminderScheduleTime, saveReminderSchedule,
    manualGenerate, deleteInvoice, deleteAllInvoices, sendManualReminders, refreshInvoices 
  } = useBilling(activeTab, selectedMonth || undefined, selectedYear || undefined);

  const [selectedTime, setSelectedTime] = useState(scheduleTime);
  const [selectedDay, setSelectedDay] = useState(scheduleDay);

  const [showReminderScheduleModal, setShowReminderScheduleModal] = useState(false);
  const [selectedReminderTime, setSelectedReminderTime] = useState(reminderScheduleTime);
  const [selectedReminderDay, setSelectedReminderDay] = useState(reminderScheduleDay);
  

  useEffect(() => {
    if (scheduleTime) setSelectedTime(scheduleTime);
    if (scheduleDay) setSelectedDay(scheduleDay);
    if (reminderScheduleTime) setSelectedReminderTime(reminderScheduleTime);
    if (reminderScheduleDay) setSelectedReminderDay(reminderScheduleDay);
  }, [scheduleTime, scheduleDay, reminderScheduleTime, reminderScheduleDay]); 
  
  const handleSaveSchedule = async () => {
      await saveSchedule(selectedDay, selectedTime);
      setShowScheduleModal(false);
      toast.success("Jadwal Diperbarui", {
        description: `Pembuatan otomatis dijadwalkan pada tanggal ${selectedDay} pukul ${selectedTime} setiap bulannya.`
      });
  };

  const handleSaveReminderSchedule = async () => {
      await saveReminderSchedule(selectedReminderDay, selectedReminderTime);
      setShowReminderScheduleModal(false);
      toast.success("Jadwal Pengingat Diperbarui", {
        description: `Pengingat otomatis dijadwalkan pada tanggal ${selectedReminderDay} pukul ${selectedReminderTime} setiap bulannya.`
      });
  };

  const handleGenerateNow = async () => {
      toast("Pembuatan Tagihan Manual", {
          description: "Apakah Anda yakin? Hal ini dapat membuat tagihan ganda jika dieksekusi secara tidak tepat.",
          action: {
              label: "Konfirmasi",
              onClick: () => {
                  const promise = manualGenerate();
                  toast.promise(promise, {
                      loading: 'Membuat Tagihan...',
                      success: 'Tagihan berhasil dibuat!',
                      error: 'Gagal membuat tagihan'
                  });
              }
          },
          cancel: {
              label: "Batal",
              onClick: () => {}
          },
          duration: Infinity,
      });
  };

  const handleSendManual = async () => {
      toast("Kirim Pengingat WhatsApp", {
        description: "Kirim pengingat WhatsApp ke semua tagihan bulan ini yang statusnya tertunda?",
        action: {
            label: "Kirim",
            onClick: () => {
                const promise = sendManualReminders();
                toast.promise(promise, {
                    loading: 'Mengirim Pengingat...',
                    success: (data: any) => `Berhasil mengirim ${data.sent} pengingat!`,
                    error: 'Gagal mengirim pengingat'
                });
            }
        },
        cancel: {
            label: "Batal",
            onClick: () => {}
        },
        duration: Infinity,
    });
  };

  const handleDelete = (id: string) => {
      toast("Hapus Tagihan", {
          description: "Apakah Anda yakin ingin menghapus tagihan ini? Tindakan ini tidak dapat dibatalkan.",
          action: {
              label: "Hapus",
              onClick: () => {
                   const promise = deleteInvoice(id);
                   toast.promise(promise, {
                       loading: 'Menghapus...',
                       success: 'Tagihan berhasil dihapus',
                       error: 'Gagal menghapus tagihan'
                   });
              }
          },
          cancel: {
              label: "Batal",
              onClick: () => {}
          },
          duration: Infinity,
      });
  };

  const handleDeleteAll = () => {
      toast(`Hapus Semua Tagihan ${activeTab === 'current' ? 'Aktif' : 'Riwayat'}`, {
          description: "Apakah Anda yakin ingin menghapus semua tagihan ini? Tindakan ini tidak dapat dibatalkan.",
          action: {
              label: "Hapus Semua",
              onClick: () => {
                   const promise = deleteAllInvoices();
                   toast.promise(promise, {
                       loading: 'Menghapus semua...',
                       success: 'Semua tagihan berhasil dihapus',
                       error: 'Gagal menghapus tagihan'
                   });
              }
          },
          cancel: {
              label: "Batal",
              onClick: () => {}
          },
          duration: Infinity,
      });
  };

  const handleVerify = async (
    invoiceId: string,
    paymentMethod: 'TRANSFER' | 'CASH',
    paidAmount?: number
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const adminId = localStorage.getItem('userId') || 'admin';
      const token = Cookies.get('auth_token');
      
      if (!token) {
        toast.error('Unauthorized: Please login again');
        return;
      }
      
      const response = await fetch(`${apiUrl}/payment-module/verify/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ adminId, paymentMethod, paidAmount }),
      });

      if (response.ok) {
        toast.success('Pembayaran berhasil diverifikasi!');
        refreshInvoices();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Verification failed:', response.status, errorData);
        throw new Error(`Verification failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memverifikasi pembayaran');
    }
  };

  const handleViewProof = (invoice: any) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const handleOpenSwipeableModal = (startIndex: number) => {
    setVerificationStartIndex(startIndex);
    setSwipeableModalOpen(true);
  };


  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay(); 
  
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate stats based on current tab's invoices
  const stats = {
    total: (invoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0),
    verified: (invoices || []).filter(inv => inv.isVerified).length,
    pending: (invoices || []).filter(inv => inv.photoUrl && !inv.isVerified).length,
    unpaid: (invoices || []).filter(inv => !inv.photoUrl && !inv.isVerified).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-indigo-200 shadow-lg col-span-1 md:col-span-2">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="font-semibold text-lg text-white">Pembuatan Tagihan Otomatis</h3>
                 <p className="text-indigo-100 text-sm mt-1 max-w-sm">
                    Tagihan akan dibuat secara otomatis pada tanggal <span className="font-bold text-white">{scheduleDay}</span> pukul <span className="font-bold text-white">{scheduleTime}</span> setiap bulannya.
                 </p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                 <Zap size={24} className="text-yellow-300" />
              </div>
           </div>
           <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={handleGenerateNow}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors"
              >
                 Buat Sekarang
              </button>
              <button 
                onClick={handleSendManual}
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                 Kirim Manual
              </button>
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-indigo-500/50 text-white rounded-lg text-sm font-medium hover:bg-indigo-500/70 transition-colors border border-indigo-400/30"
              >
                 Jadwal Invoice
              </button>
              <button 
                onClick={() => setShowReminderScheduleModal(true)}
                className="px-4 py-2 bg-indigo-500/50 text-white rounded-lg text-sm font-medium hover:bg-indigo-500/70 transition-colors border border-indigo-400/30"
              >
                 Jadwal Pengingat
              </button>
           </div>
         </Card>
  
         <Card>
           <Title className="mb-2">Payment Gateway</Title>
           <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-xs shadow-sm">MD</div>
                    <div>
                       <p className="text-sm font-bold text-slate-800 dark:text-slate-50">Midtrans</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400">QRIS, GoPay, VA</p>
                    </div>
                 </div>
                 <Badge status="Inactive" size="sm" />
              </div>
              {/* <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs">XD</div>
                    <div>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Xendit</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400">Credit Cards</p>
                    </div>
                 </div>
                 <Badge status="inactive" size="sm" />
              </div> */}
           </div>
         </Card>
      </div>
  
      <Card noPadding className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

               <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('current')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'current' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Invoice List
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Riwayat
                  </button>
               </div>
                
              <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  <select 
                     value={selectedMonth}
                     onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : '')}
                     className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32 dark:text-slate-50"
                  >
                     <option value="">Bulan...</option>
                     {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                         <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
                     ))}
                  </select>

                  <select 
                     value={selectedYear}
                     onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
                     className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28 dark:text-slate-50"
                  >
                     <option value="">Tahun...</option>
                     {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(y => (
                         <option key={y} value={y}>{y}</option>
                     ))}
                  </select>
                 {invoices.length > 0 && (
                     <button
                       onClick={handleDeleteAll}
                       className="px-3 py-2 flex items-center gap-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
                     >
                       <Trash2 size={16} />
                       Hapus Semua {activeTab === 'current' ? 'Invoice Aktif' : 'Riwayat'}
                     </button>
                 )}
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" placeholder="Cari siswa..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white dark:bg-slate-900 dark:text-slate-50"/>
                 </div>
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 relative">
                       <Filter size={18}/>
                       {filterStatus !== 'all' && (
                         <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                       )}
                     </button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-56">
                     <DropdownMenuLabel>Saring Status</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                       <div className="flex items-center justify-between w-full">
                         <span>Semua Tagihan ({invoices.length})</span>
                         {filterStatus === 'all' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilterStatus('unpaid')}>
                       <div className="flex items-center justify-between w-full">
                         <span>Belum Bayar ({stats.unpaid})</span>
                         {filterStatus === 'unpaid' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                       <div className="flex items-center justify-between w-full">
                         <span>Menunggu Verifikasi ({stats.pending})</span>
                         {filterStatus === 'pending' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilterStatus('verified')}>
                       <div className="flex items-center justify-between w-full">
                         <span>Terverifikasi ({stats.verified})</span>
                         {filterStatus === 'verified' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
              </div>
          </div>
          <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth">
              <button 
                  onClick={() => setFilterStatus('all')}
                  className={`flex items-center whitespace-nowrap gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      filterStatus === 'all' 
                      ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' 
                      : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
              >
                  Semua Tagihan
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                      filterStatus === 'all' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-slate-200 dark:bg-slate-800/80 text-slate-500'
                  }`}>{invoices.length}</span>
              </button>
              
              <button 
                  onClick={() => setFilterStatus('unpaid')}
                  className={`flex items-center whitespace-nowrap gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      filterStatus === 'unpaid' 
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 shadow-sm' 
                      : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
              >
                  Belum Bayar
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                      filterStatus === 'unpaid' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300' : 'bg-slate-200 dark:bg-slate-800/80 text-slate-500'
                  }`}>{stats.unpaid}</span>
              </button>
              
              <button 
                  onClick={() => setFilterStatus('pending')}
                  className={`flex items-center whitespace-nowrap gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      filterStatus === 'pending' 
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm' 
                      : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
              >
                  Menunggu Verifikasi
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                      filterStatus === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-800/80 text-slate-500'
                  }`}>{stats.pending}</span>
              </button>
              
              <button 
                  onClick={() => setFilterStatus('verified')}
                  className={`flex items-center whitespace-nowrap gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      filterStatus === 'verified' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                      : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
              >
                  Terverifikasi
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                      filterStatus === 'verified' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800/80 text-slate-500'
                  }`}>{stats.verified}</span>
              </button>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
                <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400">
                    <Loader2 className="animate-spin mr-2" /> Memuat data tagihan...
                </div>
            ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400">
                    <p>Tidak ada tagihan yang sesuai dengan pencarian tab {activeTab}.</p>
                </div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">ID Tagihan</th>
                            <th className="px-6 py-3">Nama Siswa</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Nominal</th>
                            <th className="px-6 py-3">Bukti</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {invoices
                          .filter((inv) => {
                            if (filterStatus === 'all') return true;
                            if (filterStatus === 'verified') return inv.isVerified;
                            if (filterStatus === 'pending') return inv.photoUrl && !inv.isVerified;
                            if (filterStatus === 'unpaid') return !inv.photoUrl && !inv.isVerified;
                            return true;
                          })
                          .map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-3 text-sm font-mono text-slate-500 dark:text-slate-400">#{inv.id.substring(0, 8)}...</td>
                                <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-slate-50">{inv.student}</td>
                                <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{inv.category}</td>
                                <td className="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{inv.date}</td>
                                <td className="px-6 py-3">
                                    <div className="space-y-1">
                                        {inv.uniqueCode ? (
                                            <>
                                                <UniqueAmountDisplay 
                                                    baseAmount={inv.amount} 
                                                    uniqueCode={inv.uniqueCode}
                                                    size="sm"
                                                />
                                                {inv.paymentMethod && (
                                                    <div className="flex items-center gap-1">
                                                        {inv.paymentMethod === 'CASH' ? (
                                                            <Banknote size={12} className="text-emerald-600" />
                                                        ) : (
                                                            <CreditCard size={12} className="text-indigo-600" />
                                                        )}
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                                                            {inv.paymentMethod}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                                {formatIDR(inv.amount)}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    {inv.photoUrl ? (
                                        <CheckCircle className="text-emerald-500" size={20} />
                                    ) : (
                                        <XCircle className="text-slate-300" size={20} />
                                    )}
                                </td>
                                <td className="px-6 py-3">
                                    <InvoiceStatusBadge invoice={inv} />
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <MoreHorizontal size={18}/>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                            <DropdownMenuItem 
                                                className="cursor-pointer"
                                                onClick={() => window.location.href = `/invoice/${inv.id}`} 
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Lihat Rincian Tagihan
                                            </DropdownMenuItem>
                                            
                                            {inv.photoUrl && (
                                                <>
                                                    <DropdownMenuItem 
                                                        className="cursor-pointer text-blue-600 dark:text-blue-400"
                                                        onClick={() => handleViewProof(inv)} 
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Lihat Bukti Transfer
                                                    </DropdownMenuItem>
                                                    {!inv.isVerified && (
                                                        <DropdownMenuItem 
                                                            className="cursor-pointer text-emerald-600 dark:text-emerald-400"
                                                            onClick={() => {
                                                                const invoiceIndex = invoices.findIndex(i => i.id === inv.id);
                                                                handleOpenSwipeableModal(invoiceIndex);
                                                            }} 
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Verifikasi Kilat (Mode Geser)
                                                        </DropdownMenuItem>
                                                    )}
                                                </>
                                            )}

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                                                onClick={() => handleDelete(inv.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Hapus Data
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
          </div>
      </Card>


      {showScheduleModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <Title>Konfigurasi Jadwal</Title>
                    <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        &times;
                    </button>
                </div>
                
                <div className="mb-4 flex items-center justify-between">
                     <span className="font-semibold text-slate-700 dark:text-slate-200">{monthName}</span>
                     
                     <input 
                        type="time" 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                     />
                </div>

                <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilih tanggal untuk mengatur pembuatan tagihan otomatis secara bulanan.
                    </p>
                    

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-[10px] uppercase font-bold text-slate-400">{d}</span>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">

                       {Array.from({ length: startDay }).map((_, i) => (
                           <div key={`empty-${i}`} />
                       ))}
                       

                       {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                           const isToday = day === today.getDate();

                           
                           return (
                               <button
                                  key={day}
                                  onClick={() => setSelectedDay(day)}
                                  className={`aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-all
                                    ${day === selectedDay 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : isToday 
                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ring-1 ring-indigo-500'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                               >
                                  {day}
                               </button>
                           );
                       })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                        <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 block"></span>
                            <span>Akan Dieksekusi</span>
                        </div>
                         <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-500 block"></span>
                            <span>Hari Ini</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveSchedule}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Simpan Konfigurasi
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}

      {showReminderScheduleModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <Title>Jadwal Pengingat Tagihan</Title>
                    <button onClick={() => setShowReminderScheduleModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        &times;
                    </button>
                </div>
                
                <div className="mb-4 flex items-center justify-between">
                     <span className="font-semibold text-slate-700 dark:text-slate-200">{monthName}</span>
                     
                     <input 
                        type="time" 
                        value={selectedReminderTime}
                        onChange={(e) => setSelectedReminderTime(e.target.value)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                     />
                </div>

                <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilih tanggal untuk mengirim otomatis pesan pengingat tagihan (via WhatsApp) jika tagihan belum lunas lebih dari 7 hari.
                    </p>
                    

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-[10px] uppercase font-bold text-slate-400">{d}</span>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">

                       {Array.from({ length: startDay }).map((_, i) => (
                           <div key={`empty-rem-${i}`} />
                       ))}
                       

                       {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                           const isToday = day === today.getDate();

                           
                           return (
                               <button
                                  key={day}
                                  onClick={() => setSelectedReminderDay(day)}
                                  className={`aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-all
                                    ${day === selectedReminderDay 
                                        ? 'bg-orange-500 text-white shadow-md' 
                                        : isToday 
                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 ring-1 ring-orange-500'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                               >
                                  {day}
                               </button>
                           );
                       })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                        <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-orange-500 block"></span>
                            <span>Akan Dieksekusi</span>
                        </div>
                         <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-orange-100 dark:bg-orange-900/50 border border-orange-500 block"></span>
                            <span>Hari Ini</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveReminderSchedule}
                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Simpan Jadwal Pengingat
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}

      {selectedInvoice && (
        <ProofViewerModal
          invoice={selectedInvoice}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onVerify={handleVerify}
          apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}
        />
      )}

      <SwipeableVerificationModal
        invoices={invoices}
        startIndex={verificationStartIndex}
        isOpen={swipeableModalOpen}
        onClose={() => setSwipeableModalOpen(false)}
        onVerify={handleVerify}
        apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}
      />
    </div>
  );
}
