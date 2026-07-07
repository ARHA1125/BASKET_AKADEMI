'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text } from '@/components/ui/notifications/Common';
import { Button } from '@/components/Button';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Eye, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Bug
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { SystemFeedback } from '@/types/feedback';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

const CATEGORIES = [
  { id: 'GENERAL', label: 'Saran Umum', icon: HelpCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
  { id: 'BUG', label: 'Laporan Bug', icon: Bug, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' },
  { id: 'FEATURE_REQUEST', label: 'Usulan Fitur', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  { id: 'OTHER', label: 'Lainnya', icon: MessageSquare, color: 'text-slate-500 bg-slate-50 dark:bg-slate-950/30' },
] as const;

export default function StudentFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<SystemFeedback[]>([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'BUG' | 'FEATURE_REQUEST' | 'GENERAL' | 'OTHER'>('GENERAL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/feedbacks/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        toast.error('Gagal mengambil riwayat masukan');
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Isi saran/masukan tidak boleh kosong');
      return;
    }

    setSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          category,
        }),
      });

      if (response.ok) {
        toast.success('Saran & Masukan Anda berhasil dikirim');
        setContent('');
        setCategory('GENERAL');
        fetchFeedbacks();
      } else {
        const errData = await response.json();
        toast.error(errData.message || 'Gagal mengirim saran');
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: SystemFeedback['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full">
            <Clock size={12} />
            Menunggu Review
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full">
            <Eye size={12} />
            Telah Direview
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={12} />
            Tuntas
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: SystemFeedback['category']) => {
    return CATEGORIES.find(c => c.id === cat)?.label || cat;
  };

  return (
    <div className="space-y-6">
      <div>
        <Title className="text-2xl font-bold text-slate-900 dark:text-white">Saran & Masukan Siswa</Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">
          Bantu kami meningkatkan kualitas portal siswa Wirabhakti. Laporkan bug, berikan saran fitur, atau kirimkan masukan umum Anda di sini.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Kirim Masukan</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          category === cat.id
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className={`p-1 rounded-lg ${cat.color}`}>
                          <IconComp size={14} />
                        </span>
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Deskripsi Masukan</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan masukan, saran, detail bug, atau usulan fitur Anda secara jelas..."
                  className="w-full min-h-[150px] rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-sm focus:border-blue-600 focus:outline-none dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Kirim Masukan
              </Button>
            </form>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Riwayat Masukan Anda</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="animate-spin text-slate-300 mb-2" size={32} />
              <Text className="text-sm text-slate-400">Memuat riwayat masukan...</Text>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <MessageSquare size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
              <h4 className="font-semibold text-base text-slate-800 dark:text-slate-200">Belum Ada Masukan</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
                Anda belum pernah mengirimkan saran atau masukan tentang sistem. Masukan Anda sangat berharga bagi kami!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {feedbacks.map((item) => (
                <Card 
                  key={item.id} 
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-sm font-montserrat leading-relaxed break-words whitespace-pre-line">
                    {item.content}
                  </p>

                  {/* Admin Notes Response */}
                  {item.adminNotes && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <AlertCircle size={14} className="text-blue-500" />
                        Tanggapan Admin:
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-montserrat leading-relaxed whitespace-pre-line">
                        {item.adminNotes}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
