'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { FC } from 'react';

interface Invoice {
  id: string;
  isVerified?: boolean;
  photoUrl?: string;
}

interface InvoiceStatusBadgeProps {
  invoice: Invoice;
}

export const InvoiceStatusBadge: FC<InvoiceStatusBadgeProps> = ({ invoice }) => {
  if (invoice.isVerified) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium text-sm">
        <CheckCircle size={16} />
        <span>Terverifikasi</span>
      </div>
    );
  }

  if (invoice.photoUrl && !invoice.isVerified) {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg font-medium text-sm">
        <Clock size={16} />
        <span>Menunggu Verifikasi</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium text-sm">
      <XCircle size={16} />
      <span>Belum Bayar</span>
    </div>
  );
};
