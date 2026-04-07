'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Title, Text, Badge } from '@/components/ui/notifications/Common';
import { Plus, Search, Trash2, Loader2, Pencil, Eye, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { NewsArticle, NewsContentBlock } from '@/types/administrasi';
import NewsEditor from './NewsEditor';

export default function NewsView() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/news`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      } else {
        toast.error('Failed to fetch news');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  useGSAP(() => {
    if (!loading && news.length > 0) {
      gsap.fromTo(
        '.gsap-news-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, { scope: containerRef, dependencies: [news, loading] });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/administration/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success('Article deleted');
        fetchNews();
      } else {
        toast.error('Failed to delete article');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting article');
    }
  };

  const openCreate = () => {
    setEditingArticle(null);
    setEditorOpen(true);
  };

  const openEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setEditorOpen(true);
  };

  const handleEditorClose = (saved?: boolean) => {
    setEditorOpen(false);
    setEditingArticle(null);
    if (saved) fetchNews();
  };

  const filteredNews = news.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // If editor is visible, show it fullscreen
  if (editorOpen) {
    return <NewsEditor article={editingArticle} onClose={handleEditorClose} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title>News Management</Title>
          <Text>Create and manage news articles for the landing page.</Text>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          {/* Create */}
          <button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Create Article
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-500">
          <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
      ) : filteredNews.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText size={48} className="mb-4 text-slate-300" />
            <h3 className="font-semibold text-lg">No articles found</h3>
            <p className="text-sm mt-1">Create your first news article to get started.</p>
          </div>
        </Card>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => {
            let parsedContent: NewsContentBlock[] = [];
            try { parsedContent = JSON.parse(article.content); } catch { /* ignore */ }
            const blockCount = parsedContent.length;

            return (
              <div
                key={article.id}
                className="gsap-news-card group bg-white dark:bg-slate-950 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
              >
                {/* Cover image */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {article.image ? (
                    <img
                      src={`${apiUrl}${article.image}`}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <FileText size={40} />
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      article.status === 'published'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {article.status}
                    </span>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                    {article.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-3">
                      <span>{article.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {article.readTime}
                      </span>
                    </div>
                    <span>{blockCount} blocks</span>
                  </div>

                  {/* Date + Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400">{article.date}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(article)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
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
    </div>
  );
}
