'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text } from '@/components/ui/notifications/Common';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { 
  Search, 
  Trash2, 
  Loader2, 
  X, 
  Clock, 
  Eye, 
  CheckCircle2, 
  MessageSquare,
  Filter,
  Check,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { SystemFeedback } from '@/types/feedback';
import { Button } from '@/components/Button';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

const CATEGORIES = [
  { id: 'GENERAL', label: 'General', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30' },
  { id: 'BUG', label: 'Bug Report', color: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30' },
  { id: 'FEATURE_REQUEST', label: 'Feature Request', color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30' },
  { id: 'OTHER', label: 'Other', color: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950/30' },
] as const;

export default function FeedbackView() {
  const [feedbacks, setFeedbacks] = useState<SystemFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Review Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<SystemFeedback | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'REVIEWED' | 'RESOLVED'>('PENDING');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<SystemFeedback | null>(null);

  const fetchFeedbacks = async () => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/feedbacks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      } else {
        toast.error('Failed to fetch system feedbacks');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching feedbacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleOpenReviewModal = (feedback: SystemFeedback) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.adminNotes || '');
    setStatus(feedback.status);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    setIsSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/feedbacks/${selectedFeedback.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      });

      if (response.ok) {
        toast.success('Feedback review saved successfully');
        setIsReviewModalOpen(false);
        fetchFeedbacks();
      } else {
        toast.error('Failed to save review');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!deleteTarget) return;

    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/feedbacks/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Feedback deleted successfully');
        setDeleteTarget(null);
        fetchFeedbacks();
      } else {
        toast.error('Failed to delete feedback');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting feedback');
    }
  };

  const getStatusBadge = (status: SystemFeedback['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full">
            <Clock size={12} />
            Pending
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full">
            <Eye size={12} />
            Reviewed
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={12} />
            Resolved
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: SystemFeedback['category']) => {
    const matched = CATEGORIES.find(c => c.id === cat);
    const label = matched?.label || cat;
    const color = matched?.color || 'text-slate-600 bg-slate-50';
    return (
      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${color}`}>
        {label}
      </span>
    );
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesSearch = 
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filtering Header */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-transparent focus:border-blue-600 focus:outline-none dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={14} />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="BUG">Bug Reports</option>
              <option value="FEATURE_REQUEST">Feature Requests</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={14} />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main List */}
      {loading ? (
        <Card className="p-12 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
          <Loader2 className="animate-spin text-slate-300 mb-2" size={32} />
          <Text className="text-sm text-slate-400">Loading feedbacks...</Text>
        </Card>
      ) : filteredFeedbacks.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-300 dark:border-slate-800">
          <MessageSquare size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Feedback Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
            There are no feedbacks matching your filters.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider select-none">
                  <th className="p-4">Sender</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 max-w-md">Content</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFeedbacks.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-all">
                    {/* User profile card */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 font-bold">
                          {f.user?.fullName?.charAt(0) || <User size={16} />}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-850 dark:text-slate-200 block text-xs md:text-sm">
                            {f.user?.fullName || 'Anonymous'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-montserrat">
                            {f.user?.email} • <span className="font-bold text-blue-600 dark:text-blue-450 uppercase">{f.user?.role}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      {getCategoryBadge(f.category)}
                    </td>

                    {/* Content preview */}
                    <td className="p-4 max-w-md">
                      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm line-clamp-2 font-montserrat leading-relaxed">
                        {f.content}
                      </p>
                      {f.adminNotes && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
                          <Check size={10} /> Has Response
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs font-montserrat">
                      {new Date(f.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status badge */}
                    <td className="p-4 text-center">
                      {getStatusBadge(f.status)}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenReviewModal(f)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                          title="Review Feedback"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                          title="Delete Feedback"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Review System Feedback</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-5">
              {/* Feedback Context */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold">{selectedFeedback.user?.fullName} ({selectedFeedback.user?.role})</span>
                  <span>{new Date(selectedFeedback.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-montserrat whitespace-pre-line leading-relaxed italic">
                  &ldquo;{selectedFeedback.content}&rdquo;
                </p>
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">Update Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PENDING', 'REVIEWED', 'RESOLVED'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                        status === s
                          ? s === 'RESOLVED'
                            ? 'border-green-600 bg-green-50/50 dark:bg-green-950/20 text-green-600 dark:text-green-450'
                            : s === 'REVIEWED'
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450'
                            : 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-450'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-450'
                      }`}
                    >
                      {s === 'PENDING' && <Clock size={12} />}
                      {s === 'REVIEWED' && <Eye size={12} />}
                      {s === 'RESOLVED' && <CheckCircle2 size={12} />}
                      {s.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response/Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                  Admin Response / Tanggapan
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Tuliskan respon, jawaban, atau tindak lanjut admin. Catatan ini akan tampil di dashboard user..."
                  className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-sm focus:border-blue-600 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 bg-transparent hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  Save Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteFeedback}
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback report? This action cannot be undone."
      />
    </div>
  );
}
