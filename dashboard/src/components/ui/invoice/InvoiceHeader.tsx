import { InvoiceHeaderProps } from '@/types/invoicedata';
import { Badge } from './Common';

export const InvoiceHeader = ({ data }: InvoiceHeaderProps) => {
  return (
    <div className="p-8 border-b border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              GS
           </div>
           <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{data.school.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Excellence in Sports</p>
           </div>
        </div>
        <div className="text-right">
           <h2 className="text-2xl font-light text-slate-300 dark:text-slate-600 tracking-widest uppercase">Invoice</h2>
           <p className="font-mono text-slate-600 dark:text-slate-300 font-medium mt-1">#{data.id}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
           <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Billed To</p>
           <h3 className="font-semibold text-slate-900 dark:text-white">{data.student.name}</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-2">{data.student.id}</p>
           
           {data.student.studentNames && data.student.studentNames.length > 0 ? (
               <div className="mt-3">
                   <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Students:</p>
                   <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-0.5">
                       {data.student.studentNames.map((name, idx) => (
                           <li key={idx}>{name}</li>
                       ))}
                   </ul>
               </div>
           ) : (
               <p className="text-sm text-slate-500 dark:text-slate-400">{data.student.grade}</p>
           )}

           <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{data.student.address}</p>
        </div>
        <div className="md:text-right">
           <div className="inline-block text-left md:text-right space-y-2">
              <div className="flex justify-between md:justify-end gap-8">
                 <span className="text-sm text-slate-500 dark:text-slate-400">Issue Date:</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{data.issueDate}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-8">
                 <span className="text-sm text-slate-500 dark:text-slate-400">Due Date:</span>
                 <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{data.dueDate}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-8 pt-2">
                 <span className="text-sm text-slate-500 dark:text-slate-400 self-center">Status:</span>
                 <Badge status={data.status} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
