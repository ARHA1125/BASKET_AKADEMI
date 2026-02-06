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

  useEffect(() => {
    setMounted(true);
  }, []);
  

  const { invoices, loading, scheduleDay, scheduleTime, saveSchedule, manualGenerate, deleteInvoice, sendManualReminders, refreshInvoices } = useBilling(activeTab);
  const [selectedTime, setSelectedTime] = useState(scheduleTime);
  const [selectedDay, setSelectedDay] = useState(scheduleDay);
  

  useEffect(() => {
    if (scheduleTime) setSelectedTime(scheduleTime);
    if (scheduleDay) setSelectedDay(scheduleDay);
  }, [scheduleTime, scheduleDay]); 
  
  const handleSaveSchedule = async () => {
      await saveSchedule(selectedDay, selectedTime);
      setShowScheduleModal(false);
      toast.success("Schedule Updated", {
        description: `Auto-generation scheduled for day ${selectedDay} at ${selectedTime} of each month.`
      });
  };

  const handleGenerateNow = async () => {
      toast("Manual Invoice Generation", {
          description: "Are you sure? This may create duplicate invoices if run incorrectly.",
          action: {
              label: "Confirm",
              onClick: () => {
                  const promise = manualGenerate();
                  toast.promise(promise, {
                      loading: 'Generating Invoices...',
                      success: 'Invoices generated successfully!',
                      error: 'Failed to generate invoices'
                  });
              }
          },
          cancel: {
              label: "Cancel",
              onClick: () => {}
          },
          duration: Infinity,
      });
  };

  const handleSendManual = async () => {
      toast("Send WhatsApp Reminders", {
        description: "Send WhatsApp reminders to all pending current month invoices?",
        action: {
            label: "Send",
            onClick: () => {
                const promise = sendManualReminders();
                toast.promise(promise, {
                    loading: 'Sending Reminders...',
                    success: (data: any) => `Sent ${data.sent} reminders!`,
                    error: 'Failed to send reminders'
                });
            }
        },
        cancel: {
            label: "Cancel",
            onClick: () => {}
        },
        duration: Infinity,
    });
  };

  const handleDelete = (id: string) => {
      toast("Delete Invoice", {
          description: "Are you sure you want to delete this invoice? This action cannot be undone.",
          action: {
              label: "Delete",
              onClick: () => {
                   const promise = deleteInvoice(id);
                   toast.promise(promise, {
                       loading: 'Deleting...',
                       success: 'Invoice deleted',
                       error: 'Failed to delete invoice'
                   });
              }
          },
          cancel: {
              label: "Cancel",
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-indigo-200 shadow-lg col-span-1 md:col-span-2">
           <div className="flex justify-between items-start">
              <div>
                 <h3 className="font-semibold text-lg text-white">Automated Invoicing</h3>
                 <p className="text-indigo-100 text-sm mt-1 max-w-sm">
                    Invoices are generated automatically on day <span className="font-bold text-white">{scheduleDay}</span> at <span className="font-bold text-white">{scheduleTime}</span> of every month.
                 </p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                 <Zap size={24} className="text-yellow-300" />
              </div>
           </div>
           <div className="mt-6 flex gap-3">
              <button 
                onClick={handleGenerateNow}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors"
              >
                 Generate Now
              </button>
              <button 
                onClick={handleSendManual}
                className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                 Send Manual
              </button>
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-indigo-500/50 text-white rounded-lg text-sm font-medium hover:bg-indigo-500/70 transition-colors border border-indigo-400/30"
              >
                 Configure Schedule
              </button>
           </div>
         </Card>
  
         <Card>
           <Title className="mb-2">Payment Gateways</Title>
           <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400 text-xs shadow-sm">MD</div>
                    <div>
                       <p className="text-sm font-bold text-slate-800 dark:text-slate-50">Midtrans</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400">QRIS, GoPay, VA</p>
                    </div>
                 </div>
                 <Badge status="active" size="sm" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs">XD</div>
                    <div>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Xendit</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400">Credit Cards</p>
                    </div>
                 </div>
                 <Badge status="inactive" size="sm" />
              </div>
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
                    History
                  </button>
               </div>

              <div className="flex gap-2">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input type="text" placeholder="Search student..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white dark:bg-slate-900 dark:text-slate-50"/>
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
                     <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                       <div className="flex items-center justify-between w-full">
                         <span>All Invoices</span>
                         {filterStatus === 'all' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilterStatus('unpaid')}>
                       <div className="flex items-center justify-between w-full">
                         <span>Belum Bayar</span>
                         {filterStatus === 'unpaid' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                       <div className="flex items-center justify-between w-full">
                         <span>Menunggu Verifikasi</span>
                         {filterStatus === 'pending' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setFilterStatus('verified')}>
                       <div className="flex items-center justify-between w-full">
                         <span>Terverifikasi</span>
                         {filterStatus === 'verified' && <CheckCircle size={16} className="text-indigo-600" />}
                       </div>
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
              </div>
          </div>
          
          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
                <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400">
                    <Loader2 className="animate-spin mr-2" /> Loading invoices...
                </div>
            ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400">
                    <p>No invoices found via {activeTab} filter.</p>
                </div>
            ) : (
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Invoice ID</th>
                            <th className="px-6 py-3">Student Name</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Bukti</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
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
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem 
                                                className="cursor-pointer"
                                                onClick={() => window.location.href = `/invoice/${inv.id}`} 
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Invoice
                                            </DropdownMenuItem>
                                            
                                            {inv.photoUrl && (
                                                <>
                                                    <DropdownMenuItem 
                                                        className="cursor-pointer text-blue-600 dark:text-blue-400"
                                                        onClick={() => handleViewProof(inv)} 
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Bukti Transfer
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
                                                            Quick Verify (Swipe Mode)
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
                                                Delete
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
                    <Title>Schedule Config</Title>
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
                        Select a day to set as the monthly auto-invoice generation date.
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
                            <span>Selected</span>
                        </div>
                         <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-500 block"></span>
                            <span>Today</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveSchedule}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Save Configuration
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
