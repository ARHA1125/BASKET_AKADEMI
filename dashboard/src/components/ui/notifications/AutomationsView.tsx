import { useAutomationRules, useWahaStatus } from '@/hooks/use-automation';
import {
    Bot,
    MessageSquare,
    Plus,
    QrCode,
    RefreshCw,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { Badge, Card, Text, Title } from './Common';

export default function AutomationsView() {
  const { rules, loading: rulesLoading, addRule, removeRule } = useAutomationRules();
  const { status, qrCodeUrl: qrCode, refreshStatus: checkStatus } = useWahaStatus(); 

  const [newRule, setNewRule] = useState({ keyword: '', response: '' });

  const handleAddRule = async () => {
    if (!newRule.response) return;
    await addRule({ keyword: newRule.keyword, response: newRule.response, isActive: true, name: 'Auto Rule' });
    setNewRule({ keyword: '', response: '' });
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10">
           <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Bot size={24} />
                 </div>
                 <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">WhatsApp Bot</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`w-2 h-2 rounded-full ${status === 'WORKING' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                       <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">{status || 'UNKNOWN'}</p>
                    </div>
                 </div>
              </div>
              <button onClick={() => checkStatus && checkStatus()} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">
                 <RefreshCw size={18} />
              </button>
           </div>
           
           {status !== 'WORKING' && qrCode && (
             <div className="mt-6 flex justify-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="WAHA QR Code" className="w-48 h-48 object-contain" />
             </div>
           )}

           {status === 'WORKING' && (
             <div className="mt-6 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                   <QrCode size={16}/>
                   Session Active. Ready to reply.
                </p>
             </div>
           )}
        </Card>


        <Card className="lg:col-span-2">
           <Title className="mb-1">New Auto-Reply Rule</Title>
           <Text className="mb-6">Configure how the bot translates incoming messages.</Text>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Keyword (Leave empty for Catch-All)</label>
                 <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                      type="text" 
                      value={newRule.keyword}
                      onChange={(e) => setNewRule({...newRule, keyword: e.target.value})}
                      placeholder="e.g., /invoice, /schedule" 
                      className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Response (Output)</label>
                 <input 
                    type="text" 
                    value={newRule.response}
                    onChange={(e) => setNewRule({...newRule, response: e.target.value})}
                    placeholder="Message to send back..." 
                    className="w-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                 />
              </div>
           </div>
           
           <div className="mt-4 flex justify-end">
              <button 
                onClick={handleAddRule}
                disabled={!newRule.response || rulesLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <Plus size={16} />
                 Add Automation Rule
              </button>
           </div>
        </Card>
      </div>


      <Card noPadding>
         <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Title>Active Rules</Title>
            <Badge status="active" />
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                     <th className="px-6 py-3 w-1/3">Trigger Keyword</th>
                     <th className="px-6 py-3">Bot Response</th>
                     <th className="px-6 py-3 w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rulesLoading ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Loading rules...</td></tr>
                  ) : rules.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No rules configured yet.</td></tr>
                  ) : (
                    rules.map((rule) => (
                      <tr key={rule.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                               {rule.keyword || <span className="italic text-slate-400">Recall (Catch-All)</span>}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {rule.response}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => removeRule(rule.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 size={16} />
                            </button>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}
