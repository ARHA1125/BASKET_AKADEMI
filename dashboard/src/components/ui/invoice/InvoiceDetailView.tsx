'use client';

import { Button } from '@/components/ui/invoice/Common';
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500">
         <p>Failed to load invoice</p>
         <Link href="/admin" className="text-indigo-600 hover:underline mt-2">Back to Invoices</Link>
      </div>
    );
  }

  const invoiceData = {
    id: invoice.id,
    status: invoice.status.toLowerCase(), // 'unpaid', 'paid', 'overdue'
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
    total: Number(invoice.amount),
    month: invoice.month,
    deliveryStatus: invoice.deliveryStatus,
    photoUrl: invoice.photo_url || invoice.photoUrl 
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 py-8 px-4 sm:px-6 transition-colors duration-300">
      

      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors self-start sm:self-auto">
          <ChevronLeft size={16} /> Back to Invoices
        </Link>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" icon={Printer} className="flex-1 sm:flex-none" onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden transition-colors duration-300">
            
            <InvoiceHeader data={invoiceData} />
            
            <InvoiceItems items={invoiceData.items} />
            
            <InvoiceSummary 
              subtotal={invoiceData.subtotal} 
              tax={invoiceData.tax} 
              total={invoiceData.total} 
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
              
              {/* Debug Info / Status Info */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                  <h3 className="text-sm font-semibold mb-2">Invoice Details</h3>
                  <div className="text-xs text-slate-500 space-y-1">
                      <p>Month: <span className="font-mono text-slate-700 dark:text-slate-300">{invoiceData.month || '-'}</span></p>
                      <p>Delivery: <span className={`font-mono ${invoiceData.deliveryStatus === 'SUDAH_TERKIRIM' ? 'text-green-600' : 'text-amber-600'}`}>{invoiceData.deliveryStatus || '-'}</span></p>
                  </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
