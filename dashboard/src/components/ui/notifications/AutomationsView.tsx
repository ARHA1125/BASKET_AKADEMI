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
    Bell,
    Megaphone,
    Users,
    Send,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge, Card, Text, Title } from './Common';
import { useBroadcast } from '@/hooks/use-broadcast';
import { useDeliveryMonitor } from '@/hooks/use-delivery-monitor';
import { toast } from 'sonner';

export default function AutomationsView() {
  const { rules, loading: rulesLoading, addRule, removeRule } = useAutomationRules();
  const { status, qrCodeUrl: qrCode, refreshStatus: checkStatus } = useWahaStatus(); 
  const {
    overview: deliveryOverview,
    loading: deliveryLoading,
    retryingId,
    refreshOverview,
    retryDelivery,
  } = useDeliveryMonitor();

  const [newRule, setNewRule] = useState({ keyword: '', response: '' });
  const [queueKindFilter, setQueueKindFilter] = useState<'ALL' | 'INVOICE' | 'MANUAL_LATE_INVOICE' | 'REMINDER' | 'BROADCAST'>('ALL');
  const [queueStatusFilter, setQueueStatusFilter] = useState<'ALL' | 'QUEUED' | 'SENT' | 'ACKED' | 'FAILED'>('ALL');

  const formatDateTime = (value: string | null) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(value));
  };

  const kindLabel: Record<string, string> = {
    INVOICE: 'Invoice',
    MANUAL_LATE_INVOICE: 'Late Invoice',
    REMINDER: 'Reminder',
    BROADCAST: 'Broadcast',
  };

  const kindBadgeColor: Record<string, string> = {
    INVOICE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    MANUAL_LATE_INVOICE:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    REMINDER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    BROADCAST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  };

  const statusBadgeColor: Record<string, string> = {
    QUEUED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    SENT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    ACKED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    SKIPPED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };

  const runningKinds = (deliveryOverview?.activeByKind || [])
    .filter((item) => item.isRunning)
    .map((item) => kindLabel[item.kind] || item.kind);

  const queueWarning = runningKinds.length
    ? `Batch aktif: ${runningKinds.join(', ')}`
    : null;

  const filteredActiveByKind = (deliveryOverview?.activeByKind || []).filter((item) =>
    queueKindFilter === 'ALL' ? true : item.kind === queueKindFilter,
  );

  const filteredRecent = (deliveryOverview?.recent || []).filter((item) => {
    const kindMatch = queueKindFilter === 'ALL' ? true : item.kind === queueKindFilter;
    const statusMatch = queueStatusFilter === 'ALL' ? true : item.status === queueStatusFilter;
    return kindMatch && statusMatch;
  });

  const handleAddRule = async () => {
    if (!newRule.response) return;
    try {
      await addRule({ keyword: newRule.keyword, response: newRule.response, isActive: true, name: 'Auto Rule' });
      setNewRule({ keyword: '', response: '' });
      toast.success('Rule berhasil ditambahkan!');
    } catch {
      toast.error('Gagal menambahkan rule.');
    }
  };

  // Template Builder State
  const { templates, updateTemplate, createTemplate, loading: templatesLoading } = useTemplates();
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'REMINDER' | 'BROADCAST'>('INVOICE');
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  // Broadcast State
  const { loading: broadcasting, recipientCount, fetchRecipientCount, sendBroadcast } = useBroadcast();

  useEffect(() => {
    if (activeTab === 'BROADCAST') {
      fetchRecipientCount();
    }
  }, [activeTab, fetchRecipientCount]);

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
      } else if (activeTab === 'REMINDER') {
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
      } else if (activeTab === 'BROADCAST') {
        setCurrentTemplate(`*Informasi Wirabhakti Basketball Academy*

Halo {{fullName}},

[Ketik pesan broadcast Anda di sini]

*Daftar Siswa Anda:*
{{studentNames}}

Salam Olahraga,
*Wirabhakti Basketball Academy*`);
      }
    }
  }, [templates, templatesLoading, activeTab]);

  const handleSaveTemplate = async () => {
    try {
      if (currentTemplateId) {
        await updateTemplate(currentTemplateId, { content: currentTemplate });
      } else {
        await createTemplate({ 
            name: activeTab === 'INVOICE' ? 'Invoice Sender' : activeTab === 'REMINDER' ? 'Invoice Due Reminder' : 'Broadcast Message', 
            content: currentTemplate, 
            type: activeTab as TemplateType, 
            isActive: true 
        });
      }
      toast.success('Template berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan template.');
    }
  };

  const insertTag = (tag: string) => {
    setCurrentTemplate(prev => prev + tag);
  };

  // Template-dependent variables per tab
  const getQuickTags = () => {
    if (activeTab === 'BROADCAST') {
      return [
        { label: '+ Nama Wali Murid', tag: '{{fullName}}' },
        { label: '+ Daftar Siswa', tag: '{{studentNames}}' },
        { label: '+ Jumlah Siswa', tag: '{{studentCount}}' },
        { label: '+ Tanggal', tag: '{{date}}' },
        { label: '+ Line Break', tag: '\\n' },
      ];
    }
    return [
      { label: '+ Student Details', tag: '{{studentDetails}}' },
      { label: '+ Month & Year', tag: '{{monthYear}}' },
      { label: '+ Invoice Amount', tag: '{{invoiceAmount}}' },
      { label: '+ Invoice Link', tag: '{{invoiceUrl}}' },
      { label: '+ Line Break', tag: '\\n' },
    ];
  };

  const getPreviewReplacements = (text: string) => {
    return text
      .replace(/\{\{studentDetails\}\}/g, '1. Nama Siswa: Budi\\n   Kelas: Basic')
      .replace(/\{\{monthYear\}\}/g, 'Januari 2026')
      .replace(/\{\{invoiceAmount\}\}/g, '350.000')
      .replace(/\{\{invoiceUrl\}\}/g, 'https://app.wirabhakti.my.id/invoice/abc-123')
      .replace(/\{\{fullName\}\}/g, 'Bapak Budi Santoso')
      .replace(/\{\{studentNames\}\}/g, '1. Ahmad Budi (Basic)\\n2. Siti Aisyah (Intermediate)')
      .replace(/\{\{studentCount\}\}/g, '2')
      .replace(/\{\{date\}\}/g, 'Sabtu, 4 April 2026')
      .replace(/\\n/g, '\n');
  };

  const getTabColor = () => {
    if (activeTab === 'INVOICE') return 'indigo';
    if (activeTab === 'REMINDER') return 'orange';
    return 'blue';
  };

  const tabColor = getTabColor();

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

      <Card>
         <div className="flex items-start justify-between gap-4 mb-6">
            <div>
               <Title className="mb-1">Send Queue</Title>
               <Text>Monitor semua antrean pengiriman dari invoice, manual late invoice, reminder, dan broadcast.</Text>
            </div>
            <button
               onClick={() => refreshOverview().catch(() => toast.error('Gagal refresh send queue.'))}
               className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
               <RefreshCw size={16} className={deliveryLoading ? 'animate-spin' : ''} />
               Refresh Queue
            </button>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Queued', value: deliveryOverview?.summary.queued ?? 0 },
              { label: 'Sent', value: deliveryOverview?.summary.sent ?? 0 },
              { label: 'Acked', value: deliveryOverview?.summary.acked ?? 0 },
              { label: 'Failed', value: deliveryOverview?.summary.failed ?? 0 },
              { label: 'Completed Today', value: deliveryOverview?.summary.completedToday ?? 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3">
                 <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                 <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{item.value}</p>
              </div>
            ))}
         </div>

         <div className="mb-4 flex flex-wrap items-center gap-2">
            {[
              { label: 'All Kinds', value: 'ALL' },
              { label: 'Invoice', value: 'INVOICE' },
              { label: 'Late Invoice', value: 'MANUAL_LATE_INVOICE' },
              { label: 'Reminder', value: 'REMINDER' },
              { label: 'Broadcast', value: 'BROADCAST' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setQueueKindFilter(item.value as typeof queueKindFilter)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  queueKindFilter === item.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            {[
              { label: 'All Status', value: 'ALL' },
              { label: 'Queued', value: 'QUEUED' },
              { label: 'Sent', value: 'SENT' },
              { label: 'Acked', value: 'ACKED' },
              { label: 'Failed', value: 'FAILED' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setQueueStatusFilter(item.value as typeof queueStatusFilter)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  queueStatusFilter === item.value
                    ? 'bg-slate-900 text-white dark:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
         </div>

         {queueWarning && (
           <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
             {queueWarning}. Pastikan batch sebelumnya sudah selesai sebelum memulai batch besar berikutnya.
           </div>
         )}

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
               <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">Active Queue By Kind</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ETA berdasarkan jadwal antrean yang sudah dibuat.</p>
               </div>
               <div className="space-y-3">
                  {filteredActiveByKind.length ? (
                    filteredActiveByKind.map((item) => (
                      <div key={item.kind} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                         <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                               <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${kindBadgeColor[item.kind] || kindBadgeColor.INVOICE}`}>
                                  {kindLabel[item.kind] || item.kind}
                               </span>
                               <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                  {item.isRunning ? 'Batch masih berjalan' : 'Tidak ada batch aktif'}
                               </p>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{item.queued}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">queued</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
                               <p className="text-xs text-slate-500 dark:text-slate-400">Next Send</p>
                               <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">{formatDateTime(item.nextScheduledFor)}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
                               <p className="text-xs text-slate-500 dark:text-slate-400">Estimated Finish</p>
                               <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">{formatDateTime(item.latestScheduledFor)}</p>
                            </div>
                         </div>
                         <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-slate-600 dark:text-slate-300">active {item.active}</span>
                            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 text-indigo-700 dark:text-indigo-300">sent {item.sent}</span>
                            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-emerald-700 dark:text-emerald-300">acked {item.acked}</span>
                            <span className="rounded-full bg-rose-100 dark:bg-rose-900/30 px-2 py-1 text-rose-700 dark:text-rose-300">failed {item.failed}</span>
                            <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-1 text-amber-700 dark:text-amber-300">ETA {item.estimatedMinutesRemaining} min</span>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                       Tidak ada antrean aktif saat ini.
                    </div>
                  )}
               </div>
            </div>

            <div>
               <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">Recent Send Activity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">20 aktivitas terbaru.</p>
               </div>
               <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredRecent.length ? (
                    filteredRecent.map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                         <div className="flex items-start justify-between gap-3">
                            <div>
                               <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${kindBadgeColor[item.kind] || kindBadgeColor.INVOICE}`}>
                                     {kindLabel[item.kind] || item.kind}
                                  </span>
                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadgeColor[item.status] || statusBadgeColor.SKIPPED}`}>
                                     {item.status}
                                  </span>
                               </div>
                               <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">{item.recipientChatId}</p>
                               <p className="text-xs text-slate-500 dark:text-slate-400">Created {formatDateTime(item.createdAt)}</p>
                            </div>
                            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                               <p>Attempts: {item.attempts}</p>
                               <p>Scheduled: {formatDateTime(item.scheduledFor)}</p>
                            </div>
                         </div>
                         {(item.sentAt || item.ackedAt || item.failedAt) && (
                           <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-3">
                              <div>Sent: {formatDateTime(item.sentAt)}</div>
                              <div>Acked: {formatDateTime(item.ackedAt)}</div>
                              <div>Failed: {formatDateTime(item.failedAt)}</div>
                           </div>
                         )}
                         {item.error && (
                           <div className="mt-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
                              {item.error}
                           </div>
                          )}
                         {item.status === 'FAILED' && (
                           <div className="mt-3 flex justify-end">
                              <button
                                onClick={() =>
                                  toast.promise(retryDelivery(item.id), {
                                    loading: 'Mengantrekan ulang delivery...',
                                    success: 'Delivery berhasil dimasukkan ulang ke antrean.',
                                    error: (error) =>
                                      error instanceof Error ? error.message : 'Gagal retry delivery',
                                  })
                                }
                                disabled={retryingId === item.id}
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <RefreshCw size={14} className={retryingId === item.id ? 'animate-spin' : ''} />
                                Retry Failed Delivery
                              </button>
                           </div>
                         )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                       Belum ada riwayat pengiriman.
                    </div>
                  )}
               </div>
            </div>
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
         <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
               activeTab === 'BROADCAST' 
               ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400'
               : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
         >
            <Megaphone size={16} />
            Broadcast Message
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
           <div className="flex items-center justify-between mb-4">
              <div>
                 <Title className="mb-1">
                    {activeTab === 'INVOICE' ? 'Invoice Sender Template' : activeTab === 'REMINDER' ? 'Invoice Due Reminder Template' : 'Broadcast Message Template'}
                 </Title>
                 <Text>
                    {activeTab === 'INVOICE' 
                       ? ''
                       : activeTab === 'REMINDER' 
                       ? '' 
                       : ''}
                 </Text>
              </div>
              {activeTab === 'BROADCAST' && (
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
                   <Users size={16} className="text-blue-600 dark:text-blue-400" />
                   <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{recipientCount}</span>
                   <span className="text-xs text-blue-500 dark:text-blue-400">penerima</span>
                </div>
              )}
           </div>
           
           <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <Tags size={16} className={`text-${tabColor}-500`} />
                 Quick Insert Tags & Emojis
              </label>
              
              <div className="flex flex-wrap gap-2">
                 {getQuickTags().map((item) => (
                   <button 
                     key={item.tag}
                     onClick={() => insertTag(item.tag)} 
                     className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                   >
                      {item.label}
                   </button>
                 ))}
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
                       : activeTab === 'REMINDER'
                       ? 'border-orange-100 dark:border-orange-900/30 focus:ring-orange-500'
                       : 'border-blue-100 dark:border-blue-900/30 focus:ring-blue-500'
                 }`}
              />
           </div>
           
           <div className="mt-4 flex flex-wrap justify-between items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-lg p-4">
              <div className="flex items-center gap-3">
                 <button 
                    onClick={handleSaveTemplate}
                    disabled={templatesLoading || !currentTemplate.trim()}
                    className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                       activeTab === 'INVOICE'
                          ? 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700'
                          : activeTab === 'REMINDER'
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                 >
                    <Save size={16} />
                    Save {activeTab === 'INVOICE' ? 'Invoice' : activeTab === 'REMINDER' ? 'Reminder' : 'Broadcast'} Template
                 </button>

                  {activeTab === 'BROADCAST' && (
                     <button 
                        onClick={async () => {
                          if (!currentTemplateId) {
                            await handleSaveTemplate();
                            toast.info('Template disimpan otomatis sebelum mengirim.');
                          }
                          toast(`${queueWarning ? `${queueWarning} ` : ''}Kirim broadcast messages ke ${recipientCount} penerima?`, {
                            duration: 10000,
                            action: {
                             label: 'Kirim Sekarang',
                             onClick: async () => {
                                toast.info('Mengirim broadcast messages...');
                                const result = await sendBroadcast();
                                if (result) {
                                  const eta = result.estimatedDurationMinutes
                                    ? ` Estimasi selesai sekitar ${result.estimatedDurationMinutes} menit.`
                                    : '';
                                  toast.success(`Broadcast messages berhasil diantrekan ke ${result.queued} penerima!${eta}`);
                                }
                              },
                            },
                         });
                       }}
                       disabled={broadcasting || recipientCount === 0 || !currentTemplate.trim()}
                       className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <Send size={16} />
                       {broadcasting ? 'Mengirim...' : `Kirim ke ${recipientCount} Penerima`}
                    </button>
                 )}
              </div>
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
                    {getPreviewReplacements(currentTemplate)}
                 </p>
                 <div className="text-[10px] text-right mt-1 text-slate-500 dark:text-emerald-200/50">12:00 PM</div>
              </div>
           </div>
        </Card>
      </div>

    </div>
  );
}
