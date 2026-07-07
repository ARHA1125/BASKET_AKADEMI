'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common';
import { Star, Loader2, Quote, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/Button';
import { authenticatedFetch } from '@/lib/api-client';
import { Testimonial } from '@/types/administrasi';

export default function ParentTestimonialPage() {
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const fetchTestimonial = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`${apiUrl}/administration/testimonials/my`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setTestimonial(data);
          setContent(data.content);
          setRating(data.rating);
        } else {
          setTestimonial(null);
        }
      }
    } catch (error) {
      console.error('Error fetching testimonial:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Testimoni tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const isUpdate = !!testimonial;
      const url = isUpdate 
        ? `${apiUrl}/administration/testimonials/${testimonial.id}`
        : `${apiUrl}/administration/testimonials`;
      
      const method = isUpdate ? 'PATCH' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          rating,
        }),
      });

      if (response.ok) {
        toast.success(isUpdate ? 'Testimoni berhasil diperbarui' : 'Testimoni berhasil diajukan');
        setIsEditing(false);
        fetchTestimonial();
      } else {
        const errData = await response.json();
        toast.error(errData.message || 'Gagal mengirim testimoni');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full text-xs font-semibold">
            <CheckCircle size={14} />
            <span>Disetujui & Aktif</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30 px-3 py-1.5 rounded-full text-xs font-semibold">
            <AlertTriangle size={14} />
            <span>Ditolak</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Clock size={14} />
            <span>Menunggu Persetujuan</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Title className="text-2xl font-bold text-slate-900 dark:text-white">Testimoni Anda</Title>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">
          Bagikan pengalaman Anda selama bergabung dengan Wirabhakti Basketball Academy untuk ditampilkan di halaman utama.
        </Text>
      </div>

      {testimonial && !isEditing ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            {getStatusBadge(testimonial.status)}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
                />
              ))}
            </div>

            <div className="relative">
              <Quote className="absolute -top-3 -left-3 text-slate-100 dark:text-slate-800/50 -z-0" size={48} />
              <p className="text-slate-700 dark:text-slate-300 font-montserrat leading-relaxed italic text-lg z-10 relative pl-4">
                &ldquo;{testimonial.content}&rdquo;
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs text-slate-400">
                Terakhir diperbarui: {new Date(testimonial.updatedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl text-sm"
                >
                  Ubah Testimoni
                </Button>
              </div>
            </div>
          </div>

          {testimonial.status === 'rejected' && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold block mb-0.5">Testimoni Anda ditolak oleh admin</span>
                Anda dapat mengubah isi testimoni di atas untuk diajukan kembali ke admin agar disetujui.
              </div>
            </div>
          )}
          
          {testimonial.status === 'pending' && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
              <Clock className="shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-semibold block mb-0.5">Sedang dalam antrean persetujuan</span>
                Testimoni Anda akan segera ditinjau oleh admin sebelum diterbitkan di landing page.
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
            {testimonial ? 'Ubah Testimoni' : 'Tulis Testimoni Baru'}
          </h3>

          {/* Rating input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block">Rating Kepuasan</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    size={28}
                    className={val <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block">Pesan Testimoni</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan pengalaman Anda, kualitas pelatihan, perkembangan anak, atau kritik dan saran membangun..."
              rows={5}
              maxLength={400}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-4 bg-transparent text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
            <div className="text-right text-xs text-slate-400">
              {content.length}/400 karakter
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {testimonial && (
              <Button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setContent(testimonial.content);
                  setRating(testimonial.rating);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-medium py-2 px-5 rounded-xl text-sm"
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl text-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              <span>{testimonial ? 'Simpan Perubahan' : 'Kirim Testimoni'}</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
