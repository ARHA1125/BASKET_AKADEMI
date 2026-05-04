'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common'; 
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Edit2, Loader2, X, CheckCircle2, BookOpen } from 'lucide-react';
const InlineBadge = ({ children, color = 'blue', className = '' }: { children: React.ReactNode, color?: string, className?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200', // alias for yellow
    red: 'bg-red-50 text-red-700 border-red-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200', // alias for green
    gray: 'bg-slate-50 text-slate-700 border-slate-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200', // alias for gray
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${colors[color] || colors.blue} ${className}`}>
      {children}
    </span>
  );
};
import Cookies from 'js-cookie';
import { toast } from 'sonner';

import { Level, Month, WeekMaterial } from '@/types/curriculum';

export default function CurriculumBuilderView() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);

  // Modal states
  const [isAddLevelOpen, setIsAddLevelOpen] = useState(false);
  const [isAddMonthOpen, setIsAddMonthOpen] = useState(false);
  const [isAddWeekOpen, setIsAddWeekOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editLevelData, setEditLevelData] = useState({ name: '', description: '', colorCode: 'blue' });
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);
  const [editWeekData, setEditWeekData] = useState({ category: '', materialDescription: '', competencyKey: '', statDomain: 'CHR', statWeight: 1, curriculumProfiles: 'KU-10,KU-12' });
  const [editingMonthId, setEditingMonthId] = useState<string | null>(null);
  const [editMonthData, setEditMonthData] = useState({ title: '' });

  // Form states
  const [newLevel, setNewLevel] = useState({ name: '', description: '', colorCode: 'blue' });
  const [newMonth, setNewMonth] = useState({ levelId: '', monthNumber: 1, title: '' });
  const [newWeek, setNewWeek] = useState({ monthId: '', weekNumber: 1, category: '', materialDescription: '' });
  const [newWeekMeta, setNewWeekMeta] = useState({ competencyKey: '', statDomain: 'CHR', statWeight: 1, curriculumProfiles: 'KU-10,KU-12' });
  const [deleteLevelTarget, setDeleteLevelTarget] = useState<Level | null>(null);
  const [deleteWeekTarget, setDeleteWeekTarget] = useState<WeekMaterial | null>(null);
  const [deleteMonthTarget, setDeleteMonthTarget] = useState<Month | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  useEffect(() => {
    fetchCurriculumData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurriculumData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/curriculum-levels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const sortedData = Array.isArray(data) ? data : [];
        setLevels(sortedData);
        if (sortedData.length > 0 && !activeLevelId) {
          setActiveLevelId(sortedData[0].id);
        }
      } else {
        setLevels([]);
      }
    } catch (error) {
      console.error("Failed to fetch curriculum data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLevel = async (levelId: string) => {
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/academic/curriculum-levels/${levelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editLevelData)
      });
      if (res.ok) {
        toast.success("Level berhasil diupdate");
        setEditingLevelId(null);
        fetchCurriculumData();
      } else {
        toast.error("Gagal mengupdate level");
      }
    } catch (e) { toast.error("Error updating level"); }
  };

  const handleDeleteLevel = async (levelId: string) => {
      try {
        const token = Cookies.get('auth_token');
        const res = await fetch(`${apiUrl}/academic/curriculum-levels/${levelId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if(res.ok){
            toast.success("Level berhasil dihapus");
            if(activeLevelId === levelId) setActiveLevelId(null);
            fetchCurriculumData();
        } else {
            toast.error("Gagal menghapus level");
        }
      } catch (e) { toast.error("Error deleting level"); }
  }

  const activeLevel = activeLevelId ? levels.find(l => l.id === activeLevelId) : null;

  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/academic/curriculum-levels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLevel)
      });
      if (res.ok) {
        toast.success("Level added successfully");
        setIsAddLevelOpen(false);
        setNewLevel({ name: '', description: '', colorCode: 'blue' });
        fetchCurriculumData();
      } else {
         toast.error("Failed to add level");
      }
    } catch (e) { toast.error("Error adding level"); }
    finally { setSubmitting(false); }
  };

  const handleAddMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/academic/curriculum-months`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newMonth, monthNumber: Number(newMonth.monthNumber) })
      });
      if (res.ok) {
        toast.success("Month added successfully");
        setIsAddMonthOpen(false);
        setNewMonth({ levelId: '', monthNumber: 1, title: '' });
        fetchCurriculumData();
      } else {
         toast.error("Failed to add month");
      }
    } catch (e) { toast.error("Error adding month"); }
    finally { setSubmitting(false); }
  };

  const handleAddWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/academic/curriculum-week-materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...newWeek,
          ...newWeekMeta,
          statWeight: Number(newWeekMeta.statWeight),
          curriculumProfiles: newWeekMeta.curriculumProfiles
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          weekNumber: Number(newWeek.weekNumber)
        })
      });
      if (res.ok) {
        toast.success("Week Material added successfully");
        setIsAddWeekOpen(false);
        setNewWeek({ monthId: '', weekNumber: 1, category: '', materialDescription: '' });
        setNewWeekMeta({ competencyKey: '', statDomain: 'CHR', statWeight: 1, curriculumProfiles: 'KU-10,KU-12' });
        fetchCurriculumData();
      } else {
          toast.error("Failed to add week material");
      }
    } catch (e) { toast.error("Error adding week material"); }
    finally { setSubmitting(false); }
  };

  const handleEditWeek = async (weekId: string) => {
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${apiUrl}/academic/curriculum-week-materials/${weekId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editWeekData,
          statWeight: Number(editWeekData.statWeight),
          curriculumProfiles: editWeekData.curriculumProfiles
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        })
      });
      if (res.ok) {
        toast.success("Week material updated");
        setEditingWeekId(null);
        fetchCurriculumData();
      } else {
        toast.error("Failed to update week material");
      }
    } catch (e) { toast.error("Error updating week material"); }
  };

  const handleDeleteWeek = async (weekId: string) => {
      try {
        const token = Cookies.get('auth_token');
        const res = await fetch(`${apiUrl}/academic/curriculum-week-materials/${weekId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if(res.ok){
            toast.success("Materi berhasil dihapus");
            fetchCurriculumData();
        } else {
            toast.error("Gagal menghapus materi");
        }
      } catch (e) { toast.error("Error deleting week material"); }
  }

  const handleEditMonthTitle = async (monthId: string) => {
      try {
        const token = Cookies.get('auth_token');
        const res = await fetch(`${apiUrl}/academic/curriculum-months/${monthId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editMonthData)
        });
        if (res.ok) {
          toast.success("Bulan berhasil diupdate");
          setEditingMonthId(null);
          fetchCurriculumData();
        } else {
          toast.error("Gagal mengupdate bulan");
        }
      } catch (e) { toast.error("Error updating month"); }
  }

  const handleDeleteMonth = async (monthId: string) => {
       try {
        const token = Cookies.get('auth_token');
        const res = await fetch(`${apiUrl}/academic/curriculum-months/${monthId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if(res.ok){
            toast.success("Bulan berhasil dihapus");
            fetchCurriculumData();
        } else {
            toast.error("Gagal menghapus bulan");
        }
      } catch (e) { toast.error("Error deleting month"); }
  }

  const openMonthModal = (levelId: string) => {
    if (!levelId) return toast.error("Select a level first");
    setNewMonth(prev => ({ ...prev, levelId }));
    setIsAddMonthOpen(true);
  };

  const openWeekModal = (monthId: string) => {
    if (!monthId) return toast.error("Bulan tidak ditemukan");
        setNewWeek(prev => ({ ...prev, monthId }));
    setIsAddWeekOpen(true);
  };

  const getWeekMaterial = (month: Month, weeks: number[]) => {
    if (!month.weekMaterials) return null;
    return month.weekMaterials.filter(w => weeks.includes(w.weekNumber));
  };


  if (loading && levels.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <Loader2 className="animate-spin h-8 w-8 mr-3" />
        Memuat Master Kurikulum...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title className="text-xl font-semibold text-slate-900 dark:text-white">Matriks Waktu & Materi</Title>
        </div>
        <button onClick={() => setIsAddLevelOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Tambah Level Baru
        </button>
      </div>

      {levels.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center">
            <BookOpen size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium">Belum ada data kurikulum</p>
            <p className="text-sm">Silakan tambah level baru untuk memulai.</p>
        </div>
      ) : (
        <>
            {/* TOP-LEVEL SELECTION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {levels.map((level, idx) => {
                    const isActive = activeLevelId === level.id;
                    const semesterNumber = idx + 1; // Assuming order implies semester 1,2,3...
                    const monthStart = (idx * 6) + 1;
                    const monthEnd = monthStart + 5;
                    
                    // Map colorCode to specific theme classes based on reference
                    let theme = level.colorCode || 'blue';
                    let borderTop = 'border-t-4 border-t-blue-500';
                    let ring = 'ring-2 ring-blue-500';
                    let statusColorStr = 'blue';

                    if (level.colorCode === 'emerald' || level.colorCode === 'green') {
                        theme = 'green';
                        borderTop = 'border-t-4 border-t-emerald-500';
                        ring = 'ring-2 ring-emerald-500';
                        statusColorStr = 'green';
                    } else if (level.colorCode === 'amber' || level.colorCode === 'yellow') {
                        theme = 'yellow';
                        borderTop = 'border-t-4 border-t-amber-400';
                        ring = 'ring-2 ring-amber-500';
                        statusColorStr = 'yellow';
                    } else if (level.colorCode === 'red') {
                        theme = 'red';
                        borderTop = 'border-t-4 border-t-red-500';
                        ring = 'ring-2 ring-red-500';
                        statusColorStr = 'red';
                    } else if (level.colorCode === 'slate' || level.colorCode === 'gray') {
                        theme = 'gray';
                        borderTop = 'border-t-4 border-t-slate-500';
                        ring = 'ring-2 ring-slate-500';
                        statusColorStr = 'gray';
                    }
                    
                    return (
                        <div 
                            key={level.id}
                            onClick={() => !editingLevelId && setActiveLevelId(level.id)}
                            className={`
                              bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all duration-200 relative overflow-hidden group/card
                              ${borderTop}
                              ${isActive 
                                ? `${ring} transform scale-[1.02] shadow-md z-10 dark:bg-slate-900` 
                                : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900 opacity-70 hover:opacity-100'}
                            `}
                        >
                            {editingLevelId === level.id ? (
                                <div className="space-y-3 relative z-10" onClick={e => e.stopPropagation()}>
                                    <input type="text" value={editLevelData.name} onChange={e => setEditLevelData({...editLevelData, name: e.target.value})} className="w-full text-sm font-medium px-2 py-1.5 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Nama Level"/>
                                    <textarea rows={2} value={editLevelData.description || ''} onChange={e => setEditLevelData({...editLevelData, description: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Deskripsi Singkat"/>
                                    <select value={editLevelData.colorCode} onChange={e => setEditLevelData({...editLevelData, colorCode: e.target.value})} className="w-full text-xs px-2 py-1.5 border rounded dark:bg-slate-900 dark:border-slate-700">
                                        <option value="blue">Blue (Dasar)</option>
                                        <option value="emerald">Green (Menengah)</option>
                                        <option value="amber">Yellow (Lanjutan)</option>
                                        <option value="slate">Slate</option>
                                    </select>
                                    <div className="flex gap-2 justify-end mt-2">
                                        <button onClick={() => setEditingLevelId(null)} className="text-xs px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded font-medium text-slate-600 dark:text-slate-300">Batal</button>
                                        <button onClick={() => handleEditLevel(level.id)} className="text-xs px-3 py-1.5 bg-blue-600 rounded text-white font-medium">Simpan</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity flex gap-1 z-10">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingLevelId(level.id); setEditLevelData({name: level.name, description: level.description || '', colorCode: level.colorCode || 'blue'}); }} className="p-1.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700" title="Edit Level"><Edit2 size={14}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteLevelTarget(level); }} className="p-1.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded text-red-600 hover:bg-red-50 dark:hover:bg-slate-700" title="Hapus Level"><X size={14}/></button>
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className={`text-xl font-medium pr-12 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {level.name}
                                            </h3>
                                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[40px]">
                                                {level.description || `Semester ${semesterNumber} (Bulan ${monthStart} - ${monthEnd})`}
                                            </p>
                                        </div>
                                        {/* Status Badge */}
                                        <InlineBadge color={isActive ? statusColorStr : 'gray'}>
                                            {isActive ? 'Aktif' : 'Draft'}
                                        </InlineBadge>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="text-xs text-slate-400">Semester {semesterNumber}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ROADMAP TABLE AREA */}
            {activeLevel && (() => {
                let borderTopClass = 'border-t-4 border-t-blue-500';
                if (activeLevel.colorCode === 'emerald' || activeLevel.colorCode === 'green') borderTopClass = 'border-t-4 border-t-emerald-500';
                else if (activeLevel.colorCode === 'amber' || activeLevel.colorCode === 'yellow') borderTopClass = 'border-t-4 border-t-amber-400';
                else if (activeLevel.colorCode === 'red') borderTopClass = 'border-t-4 border-t-red-500';
                else if (activeLevel.colorCode === 'slate' || activeLevel.colorCode === 'gray') borderTopClass = 'border-t-4 border-t-slate-500';

                return (
                <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${borderTopClass}`}>
                    <div className="p-6 pb-4 flex justify-between items-center">
                        <Title className="text-lg">Roadmap Semester {levels.findIndex(l => l.id === activeLevel.id) + 1}: {activeLevel.name}</Title>
                        <div className="flex gap-2">
                             <button onClick={() => openMonthModal(activeLevel.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
                                 <Plus size={14}/> Tambah Bulan
                             </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 font-medium w-24">Bulan</th>
                                    <th className="px-6 py-3 font-medium">Minggu 1-2 (Fokus Materi)</th>
                                    <th className="px-6 py-3 font-medium">Minggu 3-4 (Fokus Materi)</th>
                                    <th className="px-6 py-3 font-medium w-40">Evaluasi Target</th>
                                    <th className="px-6 py-3 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {activeLevel.months && activeLevel.months.length > 0 ? (
                                    [...activeLevel.months].sort((a,b) => a.monthNumber - b.monthNumber).map((month) => {
                                        const week1_2 = getWeekMaterial(month, [1, 2]);
                                        const week3_4 = getWeekMaterial(month, [3, 4]);
                                        
                                        return (
                                            <tr key={month.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group content-start">
                                                <td className="px-6 py-5 align-top">
                                                    <div className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                                                        Bulan {month.monthNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top">
                                                    {week1_2 && week1_2.length > 0 ? (
                                                        week1_2.map((w, i) => (
                                                            <div key={w.id} className={`text-sm text-slate-600 dark:text-slate-400 group/item relative ${i > 0 ? 'mt-4 pt-4 border-t border-slate-100/50 dark:border-slate-800/50' : ''}`}>
                                                                {editingWeekId === w.id ? (
                                                                    <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-2 rounded -mx-2">
                                                                        <input type="text" value={editWeekData.category} onChange={e => setEditWeekData({...editWeekData, category: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Kategori"/>
                                                                        <textarea rows={2} value={editWeekData.materialDescription} onChange={e => setEditWeekData({...editWeekData, materialDescription: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Deskripsi"/>
                                                                        <input type="text" value={editWeekData.competencyKey} onChange={e => setEditWeekData({...editWeekData, competencyKey: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Competency Key"/>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <select value={editWeekData.statDomain} onChange={e => setEditWeekData({...editWeekData, statDomain: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700">
                                                                                <option value="SPD">SPD</option>
                                                                                <option value="SHO">SHO</option>
                                                                                <option value="PAS">PAS</option>
                                                                                <option value="DRI">DRI</option>
                                                                                <option value="DEF">DEF</option>
                                                                                <option value="PHY">PHY</option>
                                                                                <option value="CHR">CHR</option>
                                                                            </select>
                                                                            <input type="number" min="0.1" step="0.1" value={editWeekData.statWeight} onChange={e => setEditWeekData({...editWeekData, statWeight: Number(e.target.value)})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Weight"/>
                                                                        </div>
                                                                        <input type="text" value={editWeekData.curriculumProfiles} onChange={e => setEditWeekData({...editWeekData, curriculumProfiles: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Profiles csv"/>
                                                                        <div className="flex gap-1 justify-end">
                                                                            <button onClick={() => setEditingWeekId(null)} className="text-[10px] px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Batal</button>
                                                                            <button onClick={() => handleEditWeek(w.id)} className="text-[10px] px-2 py-1 bg-blue-600 rounded text-white font-medium">Simpan</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <span className="font-medium text-slate-800 dark:text-slate-300 block mb-1">{w.category}</span>
                                                                        <span className="block">{w.materialDescription}</span>
                                                                        <div className="absolute top-0 right-0 p-1 flex gap-1 bg-white/50 dark:bg-slate-900/50 rounded shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                            <button onClick={() => { setEditingWeekId(w.id); setEditWeekData({category: w.category, materialDescription: w.materialDescription, competencyKey: w.competencyKey || '', statDomain: w.statDomain || 'CHR', statWeight: Number(w.statWeight || 1), curriculumProfiles: (w.curriculumProfiles || []).join(',')}); }} className="p-1 text-slate-400 hover:text-blue-600 rounded" title="Edit"><Edit2 size={12}/></button>
                                                                            <button onClick={() => setDeleteWeekTarget(w)} className="p-1 text-slate-400 hover:text-red-600 rounded" title="Hapus"><X size={12}/></button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <button onClick={() => openWeekModal(month.id)} className="text-xs text-blue-500 hover:text-blue-700 border border-dashed border-blue-200 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            + Tambah
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 align-top border-l border-slate-100 dark:border-slate-800">
                                                    {week3_4 && week3_4.length > 0 ? (
                                                        week3_4.map((w, i) => (
                                                            <div key={w.id} className={`text-sm text-slate-600 dark:text-slate-400 group/item relative ${i > 0 ? 'mt-4 pt-4 border-t border-slate-100/50 dark:border-slate-800/50' : ''}`}>
                                                                {editingWeekId === w.id ? (
                                                                    <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-2 rounded -mx-2">
                                                                        <input type="text" value={editWeekData.category} onChange={e => setEditWeekData({...editWeekData, category: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Kategori"/>
                                                                        <textarea rows={2} value={editWeekData.materialDescription} onChange={e => setEditWeekData({...editWeekData, materialDescription: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Deskripsi"/>
                                                                        <input type="text" value={editWeekData.competencyKey} onChange={e => setEditWeekData({...editWeekData, competencyKey: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Competency Key"/>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <select value={editWeekData.statDomain} onChange={e => setEditWeekData({...editWeekData, statDomain: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700">
                                                                                <option value="SPD">SPD</option>
                                                                                <option value="SHO">SHO</option>
                                                                                <option value="PAS">PAS</option>
                                                                                <option value="DRI">DRI</option>
                                                                                <option value="DEF">DEF</option>
                                                                                <option value="PHY">PHY</option>
                                                                                <option value="CHR">CHR</option>
                                                                            </select>
                                                                            <input type="number" min="0.1" step="0.1" value={editWeekData.statWeight} onChange={e => setEditWeekData({...editWeekData, statWeight: Number(e.target.value)})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Weight"/>
                                                                        </div>
                                                                        <input type="text" value={editWeekData.curriculumProfiles} onChange={e => setEditWeekData({...editWeekData, curriculumProfiles: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="Profiles csv"/>
                                                                        <div className="flex gap-1 justify-end">
                                                                            <button onClick={() => setEditingWeekId(null)} className="text-[10px] px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Batal</button>
                                                                            <button onClick={() => handleEditWeek(w.id)} className="text-[10px] px-2 py-1 bg-blue-600 rounded text-white font-medium">Simpan</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <span className="font-medium text-slate-800 dark:text-slate-300 block mb-1">{w.category}</span>
                                                                        <span className="block">{w.materialDescription}</span>
                                                                        <div className="absolute top-0 right-0 p-1 flex gap-1 bg-white/50 dark:bg-slate-900/50 rounded shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                            <button onClick={() => { setEditingWeekId(w.id); setEditWeekData({category: w.category, materialDescription: w.materialDescription, competencyKey: w.competencyKey || '', statDomain: w.statDomain || 'CHR', statWeight: Number(w.statWeight || 1), curriculumProfiles: (w.curriculumProfiles || []).join(',')}); }} className="p-1 text-slate-400 hover:text-blue-600 rounded" title="Edit"><Edit2 size={12}/></button>
                                                                            <button onClick={() => setDeleteWeekTarget(w)} className="p-1 text-slate-400 hover:text-red-600 rounded" title="Hapus"><X size={12}/></button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <button onClick={() => openWeekModal(month.id)} className="text-xs text-blue-500 hover:text-blue-700 border border-dashed border-blue-200 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            + Tambah 
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top whitespace-nowrap">
                                                    <div className="flex flex-col gap-2 relative h-full">
                                                        {editingMonthId === month.id ? (
                                                            <div className="flex flex-col gap-1">
                                                                <input type="text" value={editMonthData.title} onChange={e => setEditMonthData({title: e.target.value})} className="w-full text-xs px-2 py-1 border rounded dark:bg-slate-900 dark:border-slate-700" placeholder="KPI"/>
                                                                <div className="flex justify-end gap-1">
                                                                    <button onClick={() => setEditingMonthId(null)} className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded"><X size={10}/></button>
                                                                    <button onClick={() => handleEditMonthTitle(month.id)} className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded"><CheckCircle2 size={10}/></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            month.title && (
                                                                <div className="relative group/badge w-full text-center flex justify-center">
                                                                    <InlineBadge color={month.title.includes('Lulus') || month.title.includes('Kenaikan') ? 'green' : (activeLevel.colorCode === 'emerald' || activeLevel.colorCode === 'amber' ? activeLevel.colorCode as any : 'blue')}>
                                                                        {month.title}
                                                                        <button onClick={() => { setEditingMonthId(month.id); setEditMonthData({title: month.title}); }} className="ml-1 opacity-0 group-hover/badge:opacity-100 hover:text-slate-900 dark:hover:text-white transition-opacity"><Edit2 size={10} /></button>
                                                                    </InlineBadge>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top text-right">
                                                    <button onClick={() => setDeleteMonthTarget(month)} className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors mr-2 hidden group-hover:inline-flex">
                                                        Hapus
                                                    </button>
                                                    <button onClick={() => openWeekModal(month.id)} className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors hidden group-hover:inline-flex" title="Tambah Materi Baru">
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
                                            <p className="mb-2">Belum ada roadmap bulan yang dibuat.</p>
                                            <button onClick={() => openMonthModal(activeLevel.id)} className="text-blue-600 hover:underline text-sm font-medium">Buat Bulan Pertama</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                );
            })()}
        </>
      )}

      {/* MODALS */}
      {isAddLevelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Title>Tambah Level Baru</Title>
              <button onClick={() => setIsAddLevelOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddLevel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Level</label>
                <input required type="text" value={newLevel.name} onChange={e => setNewLevel({...newLevel, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g Dasar / Fundamental" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                <input type="text" value={newLevel.description} onChange={e => setNewLevel({...newLevel, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g Fokus pada ballhandling & footwork" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kode Warna UI</label>
                <select value={newLevel.colorCode} onChange={e => setNewLevel({...newLevel, colorCode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="blue">Blue (Dasar)</option>
                  <option value="emerald">Green (Menengah)</option>
                  <option value="amber">Yellow (Lanjutan)</option>
                  <option value="slate">Slate</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddLevelOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center min-w-[100px]">
                  {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddMonthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Title>Tambah Baris Bulan</Title>
              <button onClick={() => setIsAddMonthOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMonth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Bulan (1-6)</label>
                <input required type="number" min="1" max="12" value={newMonth.monthNumber} onChange={e => setNewMonth({...newMonth, monthNumber: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Evaluasi (Badge KPI)</label>
                <input required type="text" value={newMonth.title} onChange={e => setNewMonth({...newMonth, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g Praktek Gerak Dasar" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddMonthOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center min-w-[100px]">
                  {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddWeekOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Title>Tambah Materi Praktek</Title>
              <button onClick={() => setIsAddWeekOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddWeek} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Minggu Ke-</label>
                <input required type="number" min="1" max="5" value={newWeek.weekNumber} onChange={e => setNewWeek({...newWeek, weekNumber: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs mt-1 text-slate-500">Materi M1/M2 akan masuk ke kolom kiri. M3/M4 masuk ke kolom kanan.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori / Fokus</label>
                <input required type="text" value={newWeek.category} onChange={e => setNewWeek({...newWeek, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g Dasar Body Control" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Materi Latihan Terperinci</label>
                <textarea required rows={3} value={newWeek.materialDescription} onChange={e => setNewWeek({...newWeek, materialDescription: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g (Stance, Step, Jump)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Competency Key</label>
                <input type="text" value={newWeekMeta.competencyKey} onChange={e => setNewWeekMeta({...newWeekMeta, competencyKey: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g crossover_dribble" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">FUT Stat Domain</label>
                  <select value={newWeekMeta.statDomain} onChange={e => setNewWeekMeta({...newWeekMeta, statDomain: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="SPD">Speed</option>
                    <option value="SHO">Shooting</option>
                    <option value="PAS">Passing</option>
                    <option value="DRI">Dribbling</option>
                    <option value="DEF">Defense</option>
                    <option value="PHY">Physical</option>
                    <option value="CHR">Character / Consistency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stat Weight</label>
                  <input type="number" min="0.1" step="0.1" value={newWeekMeta.statWeight} onChange={e => setNewWeekMeta({...newWeekMeta, statWeight: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Allowed Curriculum Profiles</label>
                <input type="text" value={newWeekMeta.curriculumProfiles} onChange={e => setNewWeekMeta({...newWeekMeta, curriculumProfiles: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="KU-10,KU-12" />
                <p className="text-xs mt-1 text-slate-500">Separate multiple profiles with commas.</p>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddWeekOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center min-w-[100px]">
                  {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteLevelTarget)}
        title="Hapus Level"
        description={`Apakah Anda yakin ingin menghapus ${deleteLevelTarget?.name || 'level ini'} beserta seluruh isinya? Tindakan ini tidak dapat dibatalkan.`}
        onOpenChange={(open) => {
          if (!open) setDeleteLevelTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteLevelTarget) return;
          await handleDeleteLevel(deleteLevelTarget.id);
          setDeleteLevelTarget(null);
        }}
        loading={loading}
        confirmLabel="Hapus"
        cancelLabel="Batal"
      />

      <ConfirmDialog
        open={Boolean(deleteWeekTarget)}
        title="Hapus Materi"
        description={`Apakah Anda yakin ingin menghapus materi ${deleteWeekTarget?.category || 'ini'}? Tindakan ini tidak dapat dibatalkan.`}
        onOpenChange={(open) => {
          if (!open) setDeleteWeekTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteWeekTarget) return;
          await handleDeleteWeek(deleteWeekTarget.id);
          setDeleteWeekTarget(null);
        }}
        loading={loading}
        confirmLabel="Hapus"
        cancelLabel="Batal"
      />

      <ConfirmDialog
        open={Boolean(deleteMonthTarget)}
        title="Hapus Bulan"
        description={`Apakah Anda yakin ingin menghapus bulan ${deleteMonthTarget?.monthNumber || ''}? Semua materi mingguan di dalamnya akan ikut terhapus.`}
        onOpenChange={(open) => {
          if (!open) setDeleteMonthTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteMonthTarget) return;
          await handleDeleteMonth(deleteMonthTarget.id);
          setDeleteMonthTarget(null);
        }}
        loading={loading}
        confirmLabel="Hapus"
        cancelLabel="Batal"
      />
    </div>
  );
}
