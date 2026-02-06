import { Mail, Phone } from 'lucide-react';

interface SupportCardProps {
  email: string;
  phone: string;
}

export const SupportCard = ({ email, phone }: SupportCardProps) => {
  return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-6 transition-all duration-500">
         <h4 className="font-semibold text-slate-900 text-base mb-4">Need Help?</h4>
         <div className="space-y-3">
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
               <Mail size={16} />
               {email}
            </a>
            <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
               <Phone size={16} />
               {phone}
            </a>
         </div>
      </div>
  );
};
