'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Title, Text } from '@/components/ui/notifications/Common';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Search, Trash2, Loader2, Pencil, Image as ImageIcon, Camera, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { GalleryAlbum, GalleryPhoto } from '@/types/administrasi';
import GalleryEditor from './GalleryEditor';

export default function GalleryView() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbum | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      } else {
        toast.error('Failed to fetch albums');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching albums');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlbums(); }, []);

  useGSAP(() => {
    if (!loading && albums.length > 0) {
      gsap.fromTo(
        '.gsap-gallery-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, { scope: containerRef, dependencies: [albums, loading] });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/gallery/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success('Album deleted');
        setDeleteTarget(null);
        fetchAlbums();
      } else {
        toast.error('Failed to delete album');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting album');
    }
  };

  const openCreate = () => {
    setEditingAlbum(null);
    setEditorOpen(true);
  };

  const openEdit = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setEditorOpen(true);
  };

  const handleEditorClose = (saved?: boolean) => {
    setEditorOpen(false);
    setEditingAlbum(null);
    if (saved) fetchAlbums();
  };

  const filteredAlbums = albums.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // If editor is open, render fullscreen editor
  if (editorOpen) {
    return <GalleryEditor album={editingAlbum} onClose={handleEditorClose} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title>Gallery Management</Title>
          <Text>Create and manage photo albums for the landing page.</Text>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <div className="relative flex-1 md:w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Create Album
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-500">
          <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
      ) : filteredAlbums.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FolderOpen size={48} className="mb-4 text-slate-300" />
            <h3 className="font-semibold text-lg">No albums found</h3>
            <p className="text-sm mt-1">Create your first gallery album to get started.</p>
          </div>
        </Card>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => {
            let photoCount = 0;
            try { photoCount = JSON.parse(album.photos).length; } catch { /* ignore */ }

            return (
              <div
                key={album.id}
                className="gsap-gallery-card group bg-white dark:bg-slate-950 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
              >
                {/* Cover image */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {album.cover ? (
                    <img
                      src={`${apiUrl}${album.cover}`}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      album.status === 'published'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {album.status}
                    </span>
                  </div>
                  {/* Photo count overlay */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Camera size={12} />
                    {photoCount} photos
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {album.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2">
                    {album.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                    {album.description}
                  </p>

                  {/* Date + Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400">{album.date}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(album)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(album)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Album"
        description={`Are you sure you want to delete ${deleteTarget?.title || 'this album'}? This action cannot be undone.`}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
