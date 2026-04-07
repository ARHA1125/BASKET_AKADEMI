'use client';

import { useState, useRef } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2,
  Loader2, UploadCloud, Send, X, GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { GalleryAlbum, GalleryPhoto } from '@/types/administrasi';

interface Props {
  album: GalleryAlbum | null;
  onClose: (saved?: boolean) => void;
}

const CATEGORIES = ['Training', 'Competition', 'Event', 'Camp', 'Achievement'];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function GalleryEditor({ album, onClose }: Props) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  const isEditing = !!album;

  // Metadata
  const [title, setTitle] = useState(album?.title || '');
  const [slug, setSlug] = useState(album?.slug || '');
  const [category, setCategory] = useState(album?.category || CATEGORIES[0]);
  const [date, setDate] = useState(album?.date || new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
  const [description, setDescription] = useState(album?.description || '');
  const [coverImage, setCoverImage] = useState<string | null>(album?.cover || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Photos
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    if (album?.photos) {
      try { return JSON.parse(album.photos); } catch { return []; }
    }
    return [];
  });

  // UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) setSlug(slugify(val));
  };

  // ── Photo management ──
  const handlePhotoUpload = async (files: FileList) => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append('photo', file);
      try {
        const token = Cookies.get('auth_token');
        const res = await fetch(`${apiUrl}/administration/gallery/upload-photo`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          setPhotos(prev => [...prev, { src: data.url, alt: file.name.replace(/\.[^.]+$/, ''), caption: '' }]);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch {
        toast.error(`Error uploading ${file.name}`);
      }
    }
    setUploading(false);
  };

  const updatePhoto = (idx: number, updates: Partial<GalleryPhoto>) => {
    setPhotos(photos.map((p, i) => (i === idx ? { ...p, ...updates } : p)));
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  // ── Drag reorder ──
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...photos];
    const [dragged] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, dragged);
    setPhotos(reordered);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  // ── Cover image ──
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverImage(URL.createObjectURL(file));
  };

  // ── Save ──
  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!description.trim()) { toast.error('Description is required'); return; }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('slug', slug || slugify(title));
    fd.append('category', category);
    fd.append('date', date);
    fd.append('description', description);
    fd.append('photos', JSON.stringify(photos));
    fd.append('status', status);
    if (coverFile) fd.append('coverImage', coverFile);

    try {
      const token = Cookies.get('auth_token');
      const url = isEditing
        ? `${apiUrl}/administration/gallery/${album!.id}`
        : `${apiUrl}/administration/gallery`;
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        toast.success(status === 'published' ? 'Album published!' : 'Draft saved!');
        onClose(true);
      } else {
        toast.error('Failed to save album');
      }
    } catch {
      toast.error('Error saving album');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => onClose()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm leading-none">
              {isEditing ? 'Edit Album' : 'Create Album'}
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{slug || 'no-slug'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

          {/* Cover image */}
          <section>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Cover Image</label>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative h-52 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-indigo-400 transition-all group bg-white dark:bg-slate-900"
            >
              {coverImage ? (
                <>
                  <img src={coverFile ? coverImage : `${apiUrl}${coverImage}`} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">Change Cover</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <UploadCloud size={32} className="mb-2" />
                  <span className="text-sm font-medium">Click to upload cover image</span>
                  <span className="text-xs text-slate-300 mt-1">Recommended: 1600 × 900</span>
                </div>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
            </div>
          </section>

          {/* Metadata grid */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Album title..."
                className="w-full px-4 py-3 text-lg font-semibold border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 dark:text-white placeholder:text-slate-300"
              />
            </div>

            {/* Row: Category, Date, Slug */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Februari 2026"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a description for this album..."
                rows={3}
                className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />
            </div>
          </section>

          {/* Photos section */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Photos
                  <span className="ml-2 text-xs font-normal text-slate-400">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Drag to reorder. Click to edit captions.</p>
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {uploading ? 'Uploading...' : 'Add Photos'}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handlePhotoUpload(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {photos.length === 0 && !uploading ? (
              <div
                onClick={() => photoInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all"
              >
                <UploadCloud size={36} className="text-slate-300 mb-3" />
                <span className="text-sm font-medium text-slate-400">Click to upload photos</span>
                <span className="text-xs text-slate-300 mt-1">You can select multiple files at once</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 transition-all ${
                      dragIdx === idx ? 'ring-2 ring-indigo-500 scale-95 opacity-70' : 'hover:ring-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {/* Drag handle */}
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 backdrop-blur-sm text-white p-1 rounded cursor-grab active:cursor-grabbing">
                        <GripVertical size={12} />
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 z-10 bg-red-500/90 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>

                    {/* Image */}
                    <img
                      src={`${apiUrl}${photo.src}`}
                      alt={photo.alt}
                      className="w-full h-32 object-cover"
                    />

                    {/* Caption */}
                    <div className="p-2">
                      <input
                        type="text"
                        value={photo.caption || ''}
                        onChange={(e) => updatePhoto(idx, { caption: e.target.value })}
                        placeholder="Add caption..."
                        className="w-full text-[11px] text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                ))}

                {/* Upload more card */}
                {uploading && (
                  <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-500/5">
                    <Loader2 size={24} className="animate-spin text-indigo-400" />
                  </div>
                )}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
