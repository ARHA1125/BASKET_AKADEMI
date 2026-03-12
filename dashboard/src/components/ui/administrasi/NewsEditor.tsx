'use client';

import { useState, useRef } from 'react';
import {
  ArrowLeft, Save, Eye, EyeOff, Plus, Trash2, ChevronUp, ChevronDown,
  Type, Heading2, Image as ImageIcon, Quote, Loader2, UploadCloud,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { NewsArticle, NewsContentBlock } from '@/types/administrasi';

interface Props {
  article: NewsArticle | null;
  onClose: (saved?: boolean) => void;
}

const CATEGORIES = ['Tournament', 'Training', 'Achievement', 'Event', 'Announcement'];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewsEditor({ article, onClose }: Props) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  const isEditing = !!article;

  // Article metadata
  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [category, setCategory] = useState(article?.category || CATEGORIES[0]);
  const [date, setDate] = useState(article?.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [author, setAuthor] = useState(article?.author || '');
  const [readTime, setReadTime] = useState(article?.readTime || '5 min read');
  const [coverImage, setCoverImage] = useState<string | null>(article?.image || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Content blocks
  const [blocks, setBlocks] = useState<NewsContentBlock[]>(() => {
    if (article?.content) {
      try { return JSON.parse(article.content); } catch { return []; }
    }
    return [{ type: 'paragraph', text: '' }];
  });

  // UI state
  const [showPreview, setShowPreview] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingBlockIdx, setUploadingBlockIdx] = useState<number | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) setSlug(slugify(val));
  };

  // ── Block management ──
  const addBlock = (type: NewsContentBlock['type']) => {
    const newBlock: NewsContentBlock = { type };
    if (type === 'paragraph' || type === 'heading' || type === 'quote') {
      newBlock.text = '';
    }
    if (type === 'image') {
      newBlock.src = '';
      newBlock.alt = '';
      newBlock.caption = '';
    }
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (idx: number, updates: Partial<NewsContentBlock>) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, ...updates } : b)));
  };

  const removeBlock = (idx: number) => {
    if (blocks.length === 1) return;
    setBlocks(blocks.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const updated = [...blocks];
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
    setBlocks(updated);
  };

  // ── Image upload for block ──
  const handleBlockImageUpload = async (idx: number, file: File) => {
    setUploadingBlockIdx(idx);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/administration/news/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        updateBlock(idx, { src: data.url, alt: file.name });
      } else {
        toast.error('Image upload failed');
      }
    } catch {
      toast.error('Error uploading image');
    } finally {
      setUploadingBlockIdx(null);
    }
  };

  // ── Cover image handling ──
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverImage(URL.createObjectURL(file));
  };

  // ── Save ──
  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!excerpt.trim()) { toast.error('Excerpt is required'); return; }
    if (!author.trim()) { toast.error('Author is required'); return; }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('slug', slug || slugify(title));
    fd.append('category', category);
    fd.append('date', date);
    fd.append('excerpt', excerpt);
    fd.append('author', author);
    fd.append('readTime', readTime);
    fd.append('content', JSON.stringify(blocks));
    fd.append('status', status);
    if (coverFile) fd.append('coverImage', coverFile);

    try {
      const token = Cookies.get('auth_token');
      const url = isEditing
        ? `${apiUrl}/administration/news/${article!.id}`
        : `${apiUrl}/administration/news`;
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        toast.success(status === 'published' ? 'Article published!' : 'Draft saved!');
        onClose(true);
      } else {
        toast.error('Failed to save article');
      }
    } catch {
      toast.error('Error saving article');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Block type labels/icons ──
  const blockMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    paragraph: { label: 'Paragraph', icon: <Type size={14} />, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    heading: { label: 'Heading', icon: <Heading2 size={14} />, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
    image: { label: 'Image', icon: <ImageIcon size={14} />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    quote: { label: 'Quote', icon: <Quote size={14} />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => onClose()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
              {isEditing ? 'Edit Article' : 'Create Article'}
            </h2>
            <p className="text-xs text-slate-400">{slug || 'no-slug'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          {/* Save draft */}
          <button
            onClick={() => handleSave('draft')}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          {/* Publish */}
          <button
            onClick={() => handleSave('published')}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish
          </button>
        </div>
      </div>

      {/* ── Main content: Editor + Preview ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT: Editor ── */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col overflow-y-auto border-r border-slate-200 dark:border-slate-800`}>
          {/* Metadata section */}
          <div className="p-5 space-y-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Cover image */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cover Image</label>
              <div
                onClick={() => coverInputRef.current?.click()}
                className="relative h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors group"
              >
                {coverImage ? (
                  <img src={coverFile ? coverImage : `${apiUrl}${coverImage}`} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <UploadCloud size={28} className="mb-2" />
                    <span className="text-sm font-medium">Click to upload cover image</span>
                  </div>
                )}
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-3 py-2.5 text-lg font-bold border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Row: Category + Author + Date */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="5 Maret 2026"
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary of the article..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Read time + Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Content blocks */}
          <div className="flex-1 p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Content Blocks</label>
              <span className="text-xs text-slate-400">{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
            </div>

            {blocks.map((block, idx) => {
              const meta = blockMeta[block.type];
              return (
                <div key={idx} className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden transition-shadow hover:shadow-sm">
                  {/* Block header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move up"><ChevronUp size={14} /></button>
                      <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30" title="Move down"><ChevronDown size={14} /></button>
                      <button onClick={() => removeBlock(idx)} className="p-1 text-slate-400 hover:text-red-500 ml-1" title="Remove"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Block content editor */}
                  <div className="p-3">
                    {block.type === 'paragraph' && (
                      <textarea
                        value={block.text || ''}
                        onChange={(e) => updateBlock(idx, { text: e.target.value })}
                        placeholder="Write your paragraph..."
                        rows={3}
                        className="w-full text-sm border-0 bg-transparent dark:text-white focus:outline-none resize-none leading-relaxed"
                      />
                    )}

                    {block.type === 'heading' && (
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) => updateBlock(idx, { text: e.target.value })}
                        placeholder="Section heading..."
                        className="w-full text-lg font-bold border-0 bg-transparent dark:text-white focus:outline-none"
                      />
                    )}

                    {block.type === 'quote' && (
                      <textarea
                        value={block.text || ''}
                        onChange={(e) => updateBlock(idx, { text: e.target.value })}
                        placeholder="Write a quote..."
                        rows={2}
                        className="w-full text-sm italic border-l-4 border-amber-400 pl-3 bg-transparent dark:text-white focus:outline-none resize-none leading-relaxed"
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-2">
                        {block.src ? (
                          <div className="relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                            <img src={`${apiUrl}${block.src}`} alt={block.alt || ''} className="w-full h-40 object-cover" />
                            <button
                              onClick={() => updateBlock(idx, { src: '', alt: '', caption: '' })}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
                            {uploadingBlockIdx === idx ? (
                              <Loader2 size={24} className="animate-spin text-indigo-500" />
                            ) : (
                              <>
                                <UploadCloud size={24} className="text-slate-400 mb-1" />
                                <span className="text-xs text-slate-400">Click to upload image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleBlockImageUpload(idx, f);
                              }}
                            />
                          </label>
                        )}
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) => updateBlock(idx, { caption: e.target.value })}
                          placeholder="Image caption (optional)"
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add block toolbar */}
            <div className="flex items-center gap-2 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 mr-2">Add block:</span>
              {(['paragraph', 'heading', 'image', 'quote'] as const).map((type) => {
                const meta = blockMeta[type];
                return (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${meta.color} hover:shadow-sm`}
                  >
                    {meta.icon}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto bg-white">
            <LivePreview
              title={title}
              category={category}
              date={date}
              coverImage={coverFile ? (coverImage || '') : (coverImage ? `${apiUrl}${coverImage}` : '')}
              excerpt={excerpt}
              author={author}
              readTime={readTime}
              blocks={blocks}
              apiUrl={apiUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Live Preview Component ──
// Mirrors the landing page news detail styling exactly
function LivePreview({
  title, category, date, coverImage, excerpt, author, readTime, blocks, apiUrl,
}: {
  title: string; category: string; date: string; coverImage: string;
  excerpt: string; author: string; readTime: string;
  blocks: NewsContentBlock[]; apiUrl: string;
}) {
  return (
    <div className="font-[Montserrat,sans-serif]">
      {/* Hero Banner */}
      <div className="relative h-[350px] w-full overflow-hidden" style={{ backgroundColor: '#000a2a' }}>
        {coverImage && (
          <img src={coverImage} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          {/* Category badge */}
          <span className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 text-white" style={{ backgroundColor: '#fcac04' }}>
            {category || 'Category'}
          </span>
          {/* Title */}
          <h1 className="text-2xl font-black text-white uppercase leading-[1.1] tracking-tight">
            {title || 'Article Title'}
          </h1>
          {/* Meta */}
          <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: '#fcac04' }}>
                {(author || 'A').charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold text-xs">{author || 'Author'}</p>
                <p className="text-white/60 text-[10px]">{date}</p>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{readTime}</span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Excerpt */}
        {excerpt && (
          <p className="text-lg text-gray-700 font-medium leading-relaxed mb-10" style={{ borderLeft: '4px solid #fcac04', paddingLeft: '1rem' }}>
            {excerpt}
          </p>
        )}

        {/* Content blocks */}
        <div className="space-y-6">
          {blocks.map((block, idx) => {
            switch (block.type) {
              case 'paragraph':
                return (
                  <p key={idx} className="text-gray-700 text-base leading-[1.8]">
                    {block.text || <span className="text-gray-300 italic">Empty paragraph...</span>}
                  </p>
                );
              case 'heading':
                return (
                  <h2 key={idx} className="text-xl font-black uppercase tracking-tight mt-8 mb-2 relative pl-4" style={{ color: '#000a2a' }}>
                    <span className="absolute left-0 top-1 bottom-1 w-1 rounded-full" style={{ backgroundColor: '#fcac04' }} />
                    {block.text || <span className="text-gray-300 italic font-normal normal-case">Section heading...</span>}
                  </h2>
                );
              case 'image':
                return (
                  <figure key={idx} className="my-8">
                    {block.src ? (
                      <div className="relative h-56 w-full overflow-hidden rounded-xl shadow-md">
                        <img src={`${apiUrl}${block.src}`} alt={block.alt || ''} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    {block.caption && (
                      <figcaption className="text-center text-gray-500 text-xs mt-3 italic">{block.caption}</figcaption>
                    )}
                  </figure>
                );
              case 'quote':
                return (
                  <blockquote key={idx} className="relative my-8 py-6 px-6 rounded-r-xl" style={{ backgroundColor: 'rgba(0,10,42,0.05)', borderLeft: '4px solid #fcac04' }}>
                    <p className="text-base font-bold italic leading-relaxed" style={{ color: '#000a2a' }}>
                      &ldquo;{block.text || <span className="text-gray-300 font-normal">Quote text...</span>}&rdquo;
                    </p>
                  </blockquote>
                );
              default:
                return null;
            }
          })}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: '#000a2a' }}>
            {category}
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
            Wirabhakti
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
            Basket
          </span>
        </div>
      </div>
    </div>
  );
}
