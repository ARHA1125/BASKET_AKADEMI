import { formatIDR } from './Common';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef } from 'react';

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
  const containerRef = useRef<HTMLTableSectionElement>(null);
  
  useGSAP(() => {
    if (items.length > 0) {
      gsap.fromTo(
        ".gsap-invoice-item",
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [items] });

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
          <tbody ref={containerRef} className="divide-y divide-slate-50 dark:divide-slate-800/50">
             {items.map((item) => (
                <tr key={item.id} className="gsap-invoice-item">
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
