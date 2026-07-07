'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Title, Text } from '@/components/ui/notifications/Common';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Search, Trash2, Loader2, Save, X, Star, Check, Ban, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Testimonial } from '@/types/administrasi';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface ParentUser {
  id: string;
  phoneNumber?: string;
  studentsCount: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    photo_url?: string;
  };
}

export default function TestimonialsView() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingParents, setLoadingParents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [parentId, setParentId] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  const containerRef = useRef<HTMLTableSectionElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      } else {
        toast.error('Failed to fetch testimonials');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching testimonials');
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      setLoadingParents(true);
      const token = Cookies.get('auth_token');
      // Fetch 100 parents for dropdown selection
      const response = await fetch(`${apiUrl}/academic/parents?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const resData = await response.json();
        setParents(resData.data || []);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoadingParents(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(() => {
    if (!loading && testimonials.length > 0) {
      gsap.fromTo(
        ".gsap-table-row",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [testimonials, loading] });

  const resetForm = () => {
    setParentId('');
    setContent('');
    setRating(5);
    setStatus('approved');
    setSelectedTestimonial(null);
  };

  const openAddModal = () => {
    resetForm();
    fetchParents();
    setIsAddModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    resetForm();
    setSelectedTestimonial(t);
    setContent(t.content);
    setRating(t.rating);
    setStatus(t.status);
    setIsEditModalOpen(true);
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId) {
      toast.error('Silakan pilih orang tua murid');
      return;
    }
    if (!content.trim()) {
      toast.error('Isi testimoni tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          parentId,
          content,
          rating,
          status,
        }),
      });

      if (response.ok) {
        toast.success('Testimonial added successfully');
        setIsAddModalOpen(false);
        resetForm();
        fetchTestimonials();
      } else {
        const errData = await response.json();
        toast.error(errData.message || 'Failed to add testimonial');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error adding testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestimonial) return;
    if (!content.trim()) {
      toast.error('Isi testimoni tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/testimonials/${selectedTestimonial.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          rating,
          status,
        }),
      });

      if (response.ok) {
        toast.success('Testimonial updated successfully');
        setIsEditModalOpen(false);
        resetForm();
        fetchTestimonials();
      } else {
        const errData = await response.json();
        toast.error(errData.message || 'Failed to update testimonial');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Testimonial status updated to ${newStatus}`);
        fetchTestimonials();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating status');
    }
  };

  const handleDeleteTestimonial = async () => {
    if (!deleteTarget) return;

    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/testimonials/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Testimonial deleted');
        setDeleteTarget(null);
        fetchTestimonials();
      } else {
        toast.error('Failed to delete testimonial');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = 
      t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.parent?.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title>Testimonials Management</Title>
          <Text className="mt-1">Manage parent reviews and testimonials displayed on the landing page.</Text>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Testimonial</span>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search testimonials or parent name..."
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No testimonials found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Parent</th>
                  <th className="p-4">Testimonial</th>
                  <th className="p-4 text-center">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody ref={containerRef}>
                {filteredTestimonials.map((t) => (
                  <tr key={t.id} className="gsap-table-row border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-sm">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                          {t.parent?.user?.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={`${apiUrl}${t.parent.user.photo_url}`} 
                              alt={t.parent.user.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            t.parent?.user?.fullName?.charAt(0) || 'P'
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {t.parent?.user?.fullName || 'Wali Murid'}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            {t.parent?.user?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                        &ldquo;{t.content}&rdquo;
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {t.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                          Approved
                        </span>
                      )}
                      {t.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
                          Rejected
                        </span>
                      )}
                      {t.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'approved')}
                            title="Approve"
                            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors focus:outline-none"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {t.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'rejected')}
                            title="Reject"
                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 hover:text-rose-700 rounded-lg transition-colors focus:outline-none"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(t)}
                          title="Edit"
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 hover:text-blue-700 rounded-lg transition-colors focus:outline-none"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          title="Delete"
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 hover:text-rose-700 rounded-lg transition-colors focus:outline-none"
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
        )}
      </div>

      {/* Add Testimonial Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Add Testimonial for Parent</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-4">
              {/* Select Parent */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Parent Murid</label>
                {loadingParents ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                    <Loader2 className="animate-spin" size={14} />
                    <span>Loading parents list...</span>
                  </div>
                ) : (
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 bg-transparent text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled className="dark:bg-slate-900">Select Parent...</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id} className="dark:bg-slate-900">
                        {p.user?.fullName} ({p.user?.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={val <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Testimonial Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Testimonial text..."
                  rows={4}
                  maxLength={400}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 bg-transparent text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 bg-transparent text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="approved" className="dark:bg-slate-900">Approved</option>
                  <option value="pending" className="dark:bg-slate-900">Pending</option>
                  <option value="rejected" className="dark:bg-slate-900">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-xl text-sm flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                  <span>Save</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Testimonial Modal */}
      {isEditModalOpen && selectedTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Edit Testimonial</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                {selectedTestimonial.parent?.user?.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={`${apiUrl}${selectedTestimonial.parent.user.photo_url}`} 
                    alt={selectedTestimonial.parent.user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedTestimonial.parent?.user?.fullName?.charAt(0) || 'P'
                )}
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">{selectedTestimonial.parent?.user?.fullName}</span>
                <span className="text-slate-400 block">{selectedTestimonial.parent?.user?.email}</span>
              </div>
            </div>

            <form onSubmit={handleEditTestimonial} className="space-y-4">
              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={val <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Testimonial Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Testimonial text..."
                  rows={4}
                  maxLength={400}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3.5 bg-transparent text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 bg-transparent text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="approved" className="dark:bg-slate-900">Approved</option>
                  <option value="pending" className="dark:bg-slate-900">Pending</option>
                  <option value="rejected" className="dark:bg-slate-900">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-xl text-sm flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTestimonial}
        title="Delete Testimonial"
        description={`Are you sure you want to delete the testimonial from "${deleteTarget?.parent?.user?.fullName}"? This action cannot be undone.`}
      />
    </div>
  );
}
