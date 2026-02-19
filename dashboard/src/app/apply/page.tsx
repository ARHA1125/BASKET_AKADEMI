'use client';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Layout,
    Loader2,
    Mail,
    Phone,
    Ruler,
    ShieldCheck,
    Trophy,
    User,
    Weight
} from 'lucide-react';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentName: string;
  studentEmail: string;
  studentDob: string;
  studentHeight: string;
  studentWeight: string;
  studentPosition: string;
}



const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon: Icon,
  placeholder,
  suffix,
  required = false
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ElementType;
  placeholder?: string;
  suffix?: string;
  required?: boolean;
}) => (
  <div className="space-y-2 group">
    <label className="text-sm font-medium text-slate-600 transition-colors group-focus-within:text-blue-600">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${Icon ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'}`}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="space-y-2 group">
    <label className="text-sm font-medium text-slate-600 transition-colors group-focus-within:text-blue-600">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Trophy size={18} />
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none"
      >
        <option value="" disabled>Pilih Posisi</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronRight className="rotate-90" size={16} />
      </div>
    </div>
  </div>
);

const StepIndicator = ({ currentStep }: { currentStep: Step }) => {
  const steps = [
    { num: 1, label: "Wali" },
    { num: 2, label: "Atlet" },
    { num: 3, label: "Tinjauan" }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-10 relative px-5">

      <div className="absolute top-1/2 left-5 right-5 h-1 bg-slate-100 -z-10 rounded-full overflow-hidden -translate-y-1/2">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />
      </div>

      {steps.map((s) => {
        const isActive = currentStep >= s.num;
        const isCurrent = currentStep === s.num;

        return (
          <div key={s.num} className="flex flex-col items-center gap-2 group cursor-default relative z-10">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-500
                ${isActive
                  ? 'bg-blue-600 border-blue-100 text-white shadow-lg shadow-blue-500/30 scale-110'
                  : 'bg-white border-slate-100 text-slate-400'
                }
              `}
            >
              {isActive && currentStep > s.num ? (
                <CheckCircle2 size={18} />
              ) : (
                s.num
              )}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};



export default function PublicApplicationWizard() {

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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

  const nextStep = () => setStep(prev => (prev < 3 ? prev + 1 as Step : prev));
  const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 as Step : prev));

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast.error('Anda harus menyetujui persyaratan layanan untuk melanjutkan.');
      return;
    }

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


  const Background = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 bg-slate-50">

      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-sky-200/40 rounded-full blur-3xl opacity-70 animate-blob animation-delay-4000" />


      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 font-sans text-slate-800 relative">
      <Toaster position="top-center" richColors />
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .slide-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <Background />

      <div className="absolute top-4 right-4 z-20">
        <button onClick={() => toast.info("Navigasi ke halaman login...")} className="hidden bg-white/50 backdrop-blur-sm border border-white/60 text-sm text-slate-600 hover:text-blue-600 hover:bg-white transition-all px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm font-medium">
          <Layout className="w-4 h-4" /> Masuk
        </button>
        <Link href="/login" className="bg-white/50 backdrop-blur-sm border border-white/60 text-sm text-slate-600 hover:text-blue-600 hover:bg-white transition-all px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm font-medium">
          <Layout className="w-4 h-4" /> Masuk
        </Link>
      </div>

      <div className="w-full max-w-3xl z-10">


        {step < 4 && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-32 h-32 bg-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0 duration-500 overflow-hidden">
              <Logo className="w-full h-full" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight mb-2">
              Pendaftaran Akademi
            </h1>
            <p className="text-slate-500 text-lg">
              Bergabunglah dengan program pelatihan elit kami.
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className={`bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 md:p-12 transition-all duration-500 ${step === 4 ? 'max-w-xl mx-auto' : ''}`}>

          {step < 4 && <StepIndicator currentStep={step} />}

          {/* Form Content Wrapper */}
          <div className="slide-in" key={step}>

            {/* --- STEP 1: WALI --- */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" />
                    Informasi Wali
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Silakan isi data orang tua atau wali murid.
                  </p>
                </div>

                <InputField
                  label="Nama Orang Tua/Wali"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso"
                  icon={User}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Email"
                    name="parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    icon={Mail}
                    required
                  />
                  <InputField
                    label="Nomor Telepon"
                    name="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="+62 812..."
                    icon={Phone}
                    required
                  />
                </div>
              </div>
            )}

            {/* --- STEP 2: ATLET --- */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="text-blue-600" />
                    Informasi Atlet
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Detail lengkap calon siswa akademi.
                  </p>
                </div>

                <InputField
                  label="Nama Lengkap Siswa"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Contoh: Ahmad Junior"
                  icon={User}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Tanggal Lahir"
                    name="studentDob"
                    type="date"
                    value={formData.studentDob}
                    onChange={handleChange}
                    icon={Calendar}
                    required
                  />
                  <InputField
                    label="Email Siswa"
                    name="studentEmail"
                    type="email"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    placeholder="siswa@email.com"
                    icon={Mail}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <InputField
                    label="Tinggi Badan"
                    name="studentHeight"
                    type="number"
                    value={formData.studentHeight}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="cm"
                    icon={Ruler}
                    required
                  />
                  <InputField
                    label="Berat Badan"
                    name="studentWeight"
                    type="number"
                    value={formData.studentWeight}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="kg"
                    icon={Weight}
                    required
                  />
                  <div className="col-span-2 md:col-span-1">
                    <SelectField
                      label="Posisi Diminati"
                      name="studentPosition"
                      value={formData.studentPosition}
                      onChange={handleChange}
                      options={[
                        { value: 'Point Guard', label: 'Point Guard' },
                        { value: 'Shooting Guard', label: 'Shooting Guard' },
                        { value: 'Small Forward', label: 'Small Forward' },
                        { value: 'Power Forward', label: 'Power Forward' },
                        { value: 'Center', label: 'Center' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 3: REVIEW --- */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Tinjau Pendaftaran</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Pastikan semua data sudah benar sebelum mengirim.
                  </p>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-6">
                  {/* Parent Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <ShieldCheck size={14} /> Data Wali
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Nama Wali</div>
                        <div className="font-semibold text-slate-900">{formData.parentName || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Email</div>
                        <div className="font-semibold text-slate-900">{formData.parentEmail || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Telepon</div>
                        <div className="font-semibold text-slate-900">{formData.parentPhone || "-"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-slate-200" />

                  {/* Student Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Trophy size={14} /> Data Atlet
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Nama Atlet</div>
                        <div className="font-semibold text-slate-900">{formData.studentName || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Tanggal Lahir</div>
                        <div className="font-semibold text-slate-900">{formData.studentDob || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Statistik Fisik</div>
                        <div className="font-semibold text-slate-900">
                          {formData.studentHeight || "0"} cm • {formData.studentWeight || "0"} kg
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Posisi</div>
                        <div className="font-semibold text-slate-900 uppercase">{formData.studentPosition || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                    Saya mengonfirmasi bahwa informasi yang diberikan akurat dan saya menyetujui persyaratan layanan dan kebijakan privasi akademi.
                  </label>
                </div>
              </div>
            )}

            {/* --- STEP 4: SUCCESS --- */}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_infinite]">
                  <CheckCircle2 size={48} className="text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Pendaftaran Berhasil!</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Terima kasih telah mendaftar. Kami telah mengirimkan email konfirmasi ke <span className="font-semibold text-slate-900">{formData.parentEmail}</span>. Tim pelatih kami akan segera menghubungi Anda.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between slide-in">
              {step > 1 ? (
                <button
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-slate-500 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  <ChevronLeft size={20} />
                  Kembali
                </button>
              ) : (
                <div /> /* Spacer */
              )}

              <button
                onClick={step === 3 ? handleSubmit : nextStep}
                type="button"
                disabled={isSubmitting || (step === 3 && !termsAccepted)}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform active:scale-95
                  ${step === 3
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                  }
                  ${(isSubmitting || (step === 3 && !termsAccepted)) ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Mengirim...
                  </>
                ) : step === 3 ? (
                  <>
                    Kirim Pendaftaran
                    <CheckCircle2 size={20} />
                  </>
                ) : (
                  <>
                    Selanjutnya
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        {step < 4 && (
          <p className="text-center text-slate-400 text-xs mt-8">
            © 2026 Wirabhakti Basketball Academy. All rights reserved.
          </p>
        )}
      </div>
    </div>
  );
}
