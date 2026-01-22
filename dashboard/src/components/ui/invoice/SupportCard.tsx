import { Mail, Phone } from 'lucide-react';

interface SupportCardProps {
  email: string;
  phone: string;
}

export const SupportCard = ({ email, phone }: SupportCardProps) => {
  return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 p-6 transition-colors duration-300">
         <h4 className="font-medium text-slate-900 dark:text-slate-200 text-sm mb-3">Need Help?</h4>
         <div className="space-y-3">
            <a href="#" className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
               <Mail size={16} />
               {email}
            </a>
            <a href="#" className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
               <Phone size={16} />
               {phone}
            </a>
         </div>
      </div>
  );
};
