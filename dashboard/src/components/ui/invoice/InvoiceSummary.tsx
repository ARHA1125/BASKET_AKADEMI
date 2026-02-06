import { InvoiceSummaryProps } from '@/types/invoiceSum';
import { formatIDR } from './Common';

export const InvoiceSummary = ({ subtotal, tax, total, uniqueCode }: InvoiceSummaryProps) => {
  return (
    <div className="p-4 sm:p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50/30 border-t border-slate-100">
       <div className="flex justify-end">
          <div className="w-full md:w-2/3 lg:w-1/2 space-y-3 sm:space-y-4">
             <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Subtotal</span>
                <span className="font-semibold text-slate-900">{formatIDR(subtotal)}</span>
             </div>
             {uniqueCode && uniqueCode > 0 && (
               <div className="flex justify-between text-xs sm:text-sm p-2.5 sm:p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex flex-col pr-2">
                    <span className="text-slate-700 font-medium">Kode Verifikasi Pembayaran</span>
                    <span className="text-[10px] sm:text-xs text-slate-500 italic">Untuk keamanan transaksi</span>
                  </div>
                  <span className="font-bold text-emerald-600 whitespace-nowrap">+{formatIDR(uniqueCode)}</span>
               </div>
             )}
             <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Tax (0%)</span>
                <span className="font-semibold text-slate-900">{formatIDR(tax)}</span>
             </div>
             <div className="border-t-2 border-blue-100 pt-3 sm:pt-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-transparent -mx-2 sm:-mx-4 px-2 sm:px-4 py-3 sm:py-4 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-slate-900">Total Amount</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{formatIDR(total)}</span>
             </div>
          </div>
       </div>
    </div>
  );
};
