import { formatIDR } from './Common';

interface InvoiceItem {
  id: number;
  desc: string;
  qty: number;
  price: number;
  total: number;
}

interface InvoiceItemsProps {
  items: InvoiceItem[];
}

export const InvoiceItems = ({ items }: InvoiceItemsProps) => {
  return (
    <div className="p-8 min-h-[300px]">
       <table className="w-full text-left">
          <thead>
             <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                <th className="py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/2">Description</th>
                <th className="py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Qty</th>
                <th className="py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Price</th>
                <th className="py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
             {items.map((item) => (
                <tr key={item.id}>
                   <td className="py-4 pr-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.desc}</p>
                   </td>
                   <td className="py-4 text-right text-sm text-slate-600 dark:text-slate-400">{item.qty}</td>
                   <td className="py-4 text-right text-sm text-slate-600 dark:text-slate-400">{formatIDR(item.price)}</td>
                   <td className="py-4 text-right text-sm font-medium text-slate-900 dark:text-slate-200">{formatIDR(item.total)}</td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );
};
