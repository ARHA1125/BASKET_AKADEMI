'use client';

import { Check, QrCode, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Common';

import { Eye } from 'lucide-react';

export const PaymentCard = ({ invoiceId = '', existingProofUrl = '' }: { invoiceId?: string, existingProofUrl?: string }) => {
  const [paymentMethod, setPaymentMethod] = useState(existingProofUrl ? 'manual' : 'qris');
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const hasProof = !!existingProofUrl || uploadSuccess;

  const handleCopyVA = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
      }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleUpload = async () => {
      if (!file || !invoiceId) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
          const res = await fetch(`${API_URL}/payment-module/upload-proof/${invoiceId}`, {
              method: 'POST',
              body: formData
          });
          if (res.ok) {
              setUploadSuccess(true);
              setFile(null);
          } else {
              alert('Failed to upload proof');
          }
      } catch (err) {
          console.error(err);
          alert('Error uploading proof');
      } finally {
          setUploading(false);
      }
  };

  const activeProofUrl = existingProofUrl 
      ? `${API_URL}/${existingProofUrl}`
      : null;

  return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden transition-colors duration-300">
         <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
            <h3 className="font-semibold text-lg">Payment Details</h3>
            <p className="text-indigo-100 text-sm mt-1">Select your preferred payment method.</p>
         </div>
         
         <div className="p-6 space-y-4">

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
               <button 
                  onClick={() => setPaymentMethod('qris')}
                  className={`py-2 text-xs font-medium rounded-md transition-all ${paymentMethod === 'qris' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
               >
                  QRIS / VA
               </button>
               <button 
                  onClick={() => setPaymentMethod('manual')}
                  className={`py-2 text-xs font-medium rounded-md transition-all ${paymentMethod === 'manual' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
               >
                  Upload Bukti Transfer
               </button>
            </div>


            <div className="pt-2">
               {paymentMethod === 'qris' && (
                  <div className="text-center space-y-4 animate-in fade-in duration-300">
                     <div className="mx-auto w-48 h-48 bg-white p-2 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <QrCode size={120} className="text-slate-800" />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Scan with GoPay / OVO / Dana</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">QR code valid for 15 minutes</p>
                     </div>
                  </div>
               )}

               {paymentMethod === 'manual' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                     <div className="p-4 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">Upload Bukti Transfer</p>
                        
                        <div className="mb-4 bg-white dark:bg-slate-800 p-3 rounded border border-indigo-100 dark:border-slate-700">
                           <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Transfer ke Rekening:</p>
                           <div className="flex justify-between items-center">
                              <div>
                                 <p className="font-bold text-slate-800 dark:text-slate-200">BCA</p>
                                 <p className="text-xs text-slate-500">a.n. Faizal</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400">1234 5678 90</p>
                                 <button onClick={() => { navigator.clipboard.writeText('1234567890'); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[10px] text-blue-500 hover:underline">
                                    {copied ? 'Copied!' : 'Copy No. Rek'}
                                 </button>
                              </div>
                           </div>
                        </div>

                        {hasProof ? (
                            <div className="space-y-3">
                                <div className="text-green-600 text-sm font-medium flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                                    <Check size={16} /> Bukti transfer berhasil diupload!
                                </div>
                                {activeProofUrl && (
                                     <Button 
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
                                        onClick={() => window.open(activeProofUrl, '_blank')}
                                     >
                                        <Eye size={16} className="mr-2"/> View Uploaded Proof
                                     </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500">Silahkan upload bukti transfer anda disini.</p>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <Button 
                                    className="w-full" 
                                    disabled={!file || uploading} 
                                    onClick={handleUpload}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Proof'}
                                </Button>
                            </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
            
            {paymentMethod === 'qris' && (
                <Button className="w-full py-3 text-base shadow-indigo-200 shadow-md">
                   I Have Paid
                </Button>
            )}
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-4">
               <ShieldCheck size={14} />
               <span>Payments secured by Midtrans</span>
            </div>
         </div>
      </div>
  );
};
