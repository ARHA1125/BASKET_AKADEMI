'use client';

import { InvoiceFooter } from '@/components/ui/invoice/InvoiceFooter';
import { InvoiceHeader } from '@/components/ui/invoice/InvoiceHeader';
import { InvoiceItems } from '@/components/ui/invoice/InvoiceItems';
import { InvoiceSummary } from '@/components/ui/invoice/InvoiceSummary';
import { PaymentCard } from '@/components/ui/invoice/PaymentCard';
import { SupportCard } from '@/components/ui/invoice/SupportCard';
import { useInvoice } from '@/hooks/use-invoice';
import {
  ChevronLeft,
  Printer
} from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailView({ params }: { params: { id: string } }) {
  const { invoice, loading, error } = useInvoice(params.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
         <p>Failed to load invoice</p>
         <Link href="/admin" className="text-blue-600 hover:underline mt-2">Back to Invoices</Link>
      </div>
    );
  }

  const invoiceData = {
    id: invoice.id,
    status: invoice.status.toLowerCase(), 
    issueDate: new Date(invoice.createdAt || invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    dueDate: new Date(invoice.dueDate || invoice.createdAt || invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    student: {
      name: invoice.parent?.user?.fullName || 'Parent', 
      id: invoice.parent?.user?.email || '-', 
      grade: '-',
      studentNames: [...new Set(invoice.items?.map((i: any) => i.student?.user?.fullName).filter(Boolean))],
      email: invoice.parent?.user?.email || '-',
      address: invoice.parent?.user?.address || '-'
    },
    school: {
      name: 'Wirabhakti Basketball Club',
      address: 'GOR Wiradadaha, Tasikmalaya',
      email: 'admin@wirabhaktibasket.com',
      phone: '+62 812-3456-7890',
      taxId: '-'
    },
    items: invoice.items?.map((item: any, idx: number) => ({
        id: idx + 1,
        desc: item.description,
        qty: 1,
        price: Number(item.amount),
        total: Number(item.amount)
    })) || [],
    subtotal: Number(invoice.amount),
    tax: 0,
    total: Number(invoice.amount) + Number(invoice.uniqueCode || 0),
    month: invoice.month,
    deliveryStatus: invoice.deliveryStatus,
    photoUrl: invoice.photo_url || invoice.photoUrl 
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 py-8 px-4 sm:px-6 relative">
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 bg-slate-50">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-sky-200/40 rounded-full blur-3xl opacity-70 animate-blob animation-delay-4000" />
        
        {/* Texture Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors self-start sm:self-auto bg-white/50 backdrop-blur-sm border border-white/60 px-4 py-2 rounded-xl shadow-sm font-medium">
          <ChevronLeft size={16} /> Back to Invoices
        </Link>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white/50 backdrop-blur-sm border border-white/60 text-sm text-slate-600 hover:text-blue-600 hover:bg-white transition-all rounded-xl shadow-sm font-medium"
          >
            <Printer size={16} />Print
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500">
            
            <InvoiceHeader data={invoiceData} />
            
            <InvoiceItems items={invoiceData.items} />
            
            <InvoiceSummary 
              subtotal={invoiceData.subtotal} 
              tax={invoiceData.tax} 
              total={invoiceData.total}
              uniqueCode={invoice.uniqueCode}
            />
            
            <InvoiceFooter email={invoiceData.school.email} />

          </div>
        </div>

        <div className="lg:col-span-1">
           <div className="sticky top-6 space-y-6">
              
              <PaymentCard invoiceId={invoiceData.id} existingProofUrl={invoiceData.photoUrl} />

              <SupportCard 
                email={invoiceData.school.email} 
                phone={invoiceData.school.phone} 
              />
              
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg p-4 rounded-2xl">
                  <h3 className="text-sm font-semibold mb-2 text-slate-900">Invoice Details</h3>
                  <div className="text-xs text-slate-500 space-y-1">
                      <p>Month: <span className="font-mono text-slate-700">{invoiceData.month || '-'}</span></p>
                      <p>Delivery: <span className={`font-mono ${invoiceData.deliveryStatus === 'SUDAH_TERKIRIM' ? 'text-green-600' : 'text-amber-600'}`}>{invoiceData.deliveryStatus || '-'}</span></p>
                  </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
