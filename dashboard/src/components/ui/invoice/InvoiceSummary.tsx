import { formatIDR } from './Common';

interface InvoiceSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
}

export const InvoiceSummary = ({ subtotal, tax, total }: InvoiceSummaryProps) => {
  return (
    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
       <div className="flex justify-end">
          <div className="w-full md:w-1/2 space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">{formatIDR(subtotal)}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tax (0%)</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">{formatIDR(tax)}</span>
             </div>
             <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatIDR(total)}</span>
             </div>
          </div>
       </div>
    </div>
  );
};
