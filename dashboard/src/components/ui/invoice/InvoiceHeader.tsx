import { Logo } from '@/components/Logo';
import { InvoiceHeaderProps } from '@/types/invoicedata';
import { Badge } from './Common';

export const InvoiceHeader = ({ data }: InvoiceHeaderProps) => {
  return (
    <div className="p-4 sm:p-6 md:p-10 border-b border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
           <div className="h-20 w-20 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br  to-indigo-700">
              <Logo className="w-full h-full" />
           </div>
           
           <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">{data.school.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Excellence in Sports</p>
           </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
           <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-slate-200 tracking-widest uppercase">Invoice</h2>
           <p className="font-mono text-slate-600 font-semibold text-sm sm:text-base mt-1 sm:mt-2">#{data.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
        <div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">Billed To</p>
           <h3 className="font-bold text-slate-900 text-base sm:text-lg">{data.student.name}</h3>
           <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-2 sm:mb-3">{data.student.id}</p>
           
           {data.student.studentNames && data.student.studentNames.length > 0 ? (
               <div className="mt-3 sm:mt-4">
                   <p className="text-xs font-semibold text-slate-500 mb-1.5 sm:mb-2">Students:</p>
                   <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-0.5 sm:space-y-1">
                       {data.student.studentNames.map((name, idx) => (
                           <li key={idx}>{name}</li>
                       ))}
                   </ul>
               </div>
           ) : (
               <p className="text-xs sm:text-sm text-slate-500">{data.student.grade}</p>
           )}

           <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">{data.student.address}</p>
        </div>
        <div className="md:text-right">
           <div className="inline-block text-left md:text-right space-y-2 sm:space-y-3 w-full">
              <div className="flex justify-between md:justify-end gap-8 sm:gap-12">
                 <span className="text-xs sm:text-sm text-slate-500">Issue Date:</span>
                 <span className="text-xs sm:text-sm font-semibold text-slate-900">{data.issueDate}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-8 sm:gap-12">
                 <span className="text-xs sm:text-sm text-slate-500">Due Date:</span>
                 <span className="text-xs sm:text-sm font-semibold text-slate-900">{data.dueDate}</span>
              </div>
              <div className="flex justify-between md:justify-end gap-8 sm:gap-12 pt-1 sm:pt-2">
                 <span className="text-xs sm:text-sm text-slate-500 self-center">Status:</span>
                 <Badge status={data.status} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
