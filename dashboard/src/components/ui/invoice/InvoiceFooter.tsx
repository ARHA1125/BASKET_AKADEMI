
interface InvoiceFooterProps {
  email: string;
}

export const InvoiceFooter = ({ email }: InvoiceFooterProps) => {
  return (
    <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
       <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">Terms & Conditions</h4>
       <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          Please make payment before the due date. Late payments may incur a 5% penalty fee. 
          For questions regarding this invoice, please contact our finance department at {email}.
       </p>
    </div>
  );
};
