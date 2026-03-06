import { useAutomationRules, useWahaStatus } from '@/hooks/use-automation';
import { useTemplates, TemplateType } from '@/hooks/use-templates';
import {
    Bot,
    MessageSquare,
    Plus,
    QrCode,
    RefreshCw,
    Trash2,
    Save,
    Tags,
    FileText,
    Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
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

  // Template Builder State
  const { templates, updateTemplate, createTemplate, loading: templatesLoading } = useTemplates();
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'REMINDER'>('INVOICE');
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const tmp = templates.find(t => t.type === activeTab && t.isActive);
    if (tmp) {
      setCurrentTemplate(tmp.content);
      setCurrentTemplateId(tmp.id);
    } else if (!templatesLoading) {
      setCurrentTemplateId(null);
      
      if (activeTab === 'INVOICE') {
        setCurrentTemplate(`*Tagihan Online*
Wirabhakti Basketball Club

Kepada Yth. Bapak / Ibu Wali Murid,
Kami informasikan tagihan kursus basket dengan detail berikut:
*Daftar Siswa:*
{{studentDetails}}

*Bulan:* {{monthYear}}
*Total Biaya:* Rp {{invoiceAmount}}

Terima kasih atas kepercayaan Anda.
Hormat kami,
*Wirabhakti Basketball Club*
*Cek Nota Tagihan:*
{{invoiceUrl}}`);
      } else {
        setCurrentTemplate(`*Peringatan Jatuh Tempo Tagihan*
Wirabhakti Basketball Club

Yth. Bapak / Ibu Wali Murid,
Mohon maaf mengganggu waktunya. Kami informasikan bahwa terdapat tagihan kursus basket yang belum lunas:
*Daftar Siswa:*
{{studentDetails}}

*Bulan:* {{monthYear}}
*Total Biaya:* Rp {{invoiceAmount}}

Mohon segera melakukan pembayaran. Abaikan pesan ini jika sudah membayar.
*Cek Nota Tagihan:*
{{invoiceUrl}}`);
      }
    }
  }, [templates, templatesLoading, activeTab]);

  const handleSaveTemplate = async () => {
    if (currentTemplateId) {
      await updateTemplate(currentTemplateId, { content: currentTemplate });
    } else {
      await createTemplate({ 
          name: activeTab === 'INVOICE' ? 'Invoice Sender' : 'Invoice Due Reminder', 
          content: currentTemplate, 
          type: activeTab as TemplateType, 
          isActive: true 
      });
    }
  };

  const insertTag = (tag: string) => {
    setCurrentTemplate(prev => prev + tag);
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

      {/* MESSAGE TEMPLATES SECTION */}
      <Title className="mt-8 mb-4">Message Templates</Title>
      
      {/* Template Type Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 mb-6 pb-2">
         <button
            onClick={() => setActiveTab('INVOICE')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
               activeTab === 'INVOICE' 
               ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
               : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
         >
            <FileText size={16} />
            Invoice Sender
         </button>
         <button
            onClick={() => setActiveTab('REMINDER')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
               activeTab === 'REMINDER' 
               ? 'border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-400'
               : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
         >
            <Bell size={16} />
            Invoice Due Reminder
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
           <div className="flex items-center justify-between mb-4">
              <div>
                 <Title className="mb-1">
                    {activeTab === 'INVOICE' ? 'Invoice Sender Template' : 'Invoice Due Reminder Template'}
                 </Title>
                 <Text>
                    {activeTab === 'INVOICE' 
                       ? 'Customize the WhatsApp message sent when an invoice is generated.'
                       : 'Customize the WhatsApp warning message sent when an invoice is 7 days overdue.'}
                 </Text>
              </div>
           </div>
           
           <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <Tags size={16} className={activeTab === 'INVOICE' ? 'text-indigo-500' : 'text-orange-500'} />
                 Quick Insert Tags
              </label>
              <div className="flex flex-wrap gap-2">
                 <button onClick={() => insertTag('{{studentDetails}}')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors">
                    + Student Details
                 </button>
                 <button onClick={() => insertTag('{{monthYear}}')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors">
                    + Month & Year
                 </button>
                 <button onClick={() => insertTag('{{invoiceAmount}}')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors">
                    + Invoice Amount
                 </button>
                 <button onClick={() => insertTag('{{invoiceUrl}}')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors">
                    + Invoice Link
                 </button>
                 <button onClick={() => insertTag('\\n')} className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-50 transition-colors">
                    + Line Break
                 </button>
              </div>
           </div>

           <div>
              <textarea 
                 value={currentTemplate}
                 onChange={(e) => setCurrentTemplate(e.target.value)}
                 rows={12}
                 placeholder="Write your template here..." 
                 className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-slate-50 dark:bg-slate-900 dark:text-slate-50 font-mono resize-y ${
                    activeTab === 'INVOICE' 
                       ? 'border-indigo-100 dark:border-indigo-900/30 focus:ring-indigo-500' 
                       : 'border-orange-100 dark:border-orange-900/30 focus:ring-orange-500'
                 }`}
              />
           </div>
           
           <div className="mt-4 flex justify-end">
              <button 
                 onClick={handleSaveTemplate}
                 disabled={templatesLoading || !currentTemplate.trim()}
                 className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeTab === 'INVOICE'
                       ? 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700'
                       : 'bg-orange-600 hover:bg-orange-700'
                 }`}
              >
                 <Save size={16} />
                 Save {activeTab === 'INVOICE' ? 'Invoice' : 'Reminder'} Template
              </button>
           </div>
        </Card>

        {/* Live Preview Card */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
           <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                 <h3 className="font-semibold text-slate-900 dark:text-slate-50">Live Preview</h3>
                 <p className="text-xs text-slate-500">How parents will see it</p>
              </div>
           </div>
           <div className="p-4 bg-[url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-cover rounded-xl shadow-inner min-h-[300px] flex flex-col justify-end">
              <div className="bg-[#E7FFDB] dark:bg-[#005C4B] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[90%] self-end">
                 <p className="text-sm text-[#111B21] dark:text-[#E9EDEF] whitespace-pre-wrap font-sans">
                    {currentTemplate
                       .replace(/\{\{studentDetails\}\}/g, '1. Nama Siswa: Budi\\n   Kelas: Basic')
                       .replace(/\{\{monthYear\}\}/g, 'Januari 2026')
                       .replace(/\{\{invoiceAmount\}\}/g, '350.000')
                       .replace(/\{\{invoiceUrl\}\}/g, 'https://app.wirabhakti.my.id/invoice/abc-123')
                       .replace(/\\n/g, '\n')
                    }
                 </p>
                 <div className="text-[10px] text-right mt-1 text-slate-500 dark:text-emerald-200/50">12:00 PM</div>
              </div>
           </div>
        </Card>
      </div>

    </div>
  );
}
