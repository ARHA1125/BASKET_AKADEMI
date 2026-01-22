'use client';

import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle,
    ClipboardList,
    Layout
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

export default function PublicApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    studentName: '',
    studentEmail: '',
    studentDob: '',
    studentHeight: '',
    studentWeight: '',
    studentPosition: 'Point Guard',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           ...formData,
           studentHeight: formData.studentHeight ? Number(formData.studentHeight) : undefined,
           studentWeight: formData.studentWeight ? Number(formData.studentWeight) : undefined,
        }),
      });

      if (response.ok) {
        setStep(4);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Pendaftaran gagal. Silakan coba lagi.');
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error('Kesalahan jaringan. Silakan coba lagi nanti.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 sm:justify-center sm:py-0 font-sans text-slate-900 overflow-x-hidden">
      
      <div className="absolute top-4 right-4">
        <button onClick={() => router.push('/login')} className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2">
          <Layout className="w-4 h-4" /> Masuk
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/20">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Pendaftaran Akademi</h1>
          <p className="text-slate-500 mt-2">Bergabunglah dengan program pelatihan elit kami. Silakan isi detail di bawah ini.</p>
        </div>

        {step < 4 && (
          <div className="mb-12 px-4">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
              <div className={`w-full h-1 bg-blue-600 absolute left-0 top-1/2 -translate-y-1/2 -z-10 rounded-full transition-all duration-300`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors relative ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
                <span className="absolute -bottom-8 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">Wali</span>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors relative ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
                <span className="absolute -bottom-8 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">Atlet</span>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors relative ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                3
                <span className="absolute -bottom-8 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">Tinjauan</span>
              </div>
            </div>
          </div>
        )}

        <Card className="p-8 shadow-lg border-0 ring-1 ring-slate-200">
          {step === 4 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Diterima!</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Terima kasih telah mendaftar. Staf pelatih kami akan meninjau profil Anda. Anda akan menerima email di <strong>{formData.parentEmail}</strong> dengan langkah selanjutnya.
              </p>
              <button 
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-xl font-semibold text-slate-900">Informasi Wali</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Nama Orang Tua/Wali</label>
                      <input 
                        required
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <input 
                          type="email"
                          required
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                          placeholder="parent@example.com"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Nomor Telepon</label>
                        <input 
                          type="tel"
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-xl font-semibold text-slate-900">Informasi Atlet</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Nama Siswa</label>
                      <input 
                        required
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                        placeholder="Masukkan nama atlet"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Email (Opsional)</label>
                      <input 
                        type="email"
                        name="studentEmail"
                        value={formData.studentEmail}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                        placeholder="student@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Tanggal Lahir</label>
                        <input 
                          type="date"
                          required
                          name="studentDob"
                          value={formData.studentDob}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                        />
                      </div>
                       <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Tinggi (cm)</label>
                        <input 
                          type="number"
                          name="studentHeight"
                          value={formData.studentHeight}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                          placeholder="180"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Berat (kg)</label>
                        <input 
                          type="number"
                          name="studentWeight"
                          value={formData.studentWeight}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                          placeholder="75"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Posisi yang Diminati</label>
                      <select 
                        name="studentPosition"
                        value={formData.studentPosition}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white text-slate-900"
                      >
                        <option>Point Guard</option>
                        <option>Shooting Guard</option>
                        <option>Small Forward</option>
                        <option>Power Forward</option>
                        <option>Center</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-xl font-semibold text-slate-900">Tinjau Pendaftaran</h2>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4 text-sm border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wali</span>
                      <span className="font-medium text-slate-900">{formData.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email Wali</span>
                      <span className="font-medium text-slate-900">{formData.parentEmail}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between">
                      <span className="text-slate-500">Atlet</span>
                      <span className="font-medium text-slate-900">{formData.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tgl Lahir</span>
                      <span className="font-medium text-slate-900">{formData.studentDob}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Statistik</span>
                      <span className="font-medium text-slate-900">{formData.studentPosition} • {formData.studentHeight}cm • {formData.studentWeight}kg</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" required id="terms" className="mt-1 rounded border-slate-300" />
                    <label htmlFor="terms" className="text-xs text-slate-500">
                      Saya mengonfirmasi bahwa informasi yang diberikan akurat dan saya menyetujui persyaratan layanan dan kebijakan privasi Akademi.
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <button 
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                  </button>
                ) : <div />}
                
                {step < 3 ? (
                  <button 
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center"
                  >
                    Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'} <Check className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
