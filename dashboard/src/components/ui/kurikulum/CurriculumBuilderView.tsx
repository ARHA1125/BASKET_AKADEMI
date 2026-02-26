'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common'; 
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import Cookies from 'js-cookie';

// Interfaces for our types based on the backend schema
interface WeekMaterial {
  id: string;
  weekNumber: number;
  category: string;
  materialDescription: string;
}

interface Month {
  id: string;
  monthNumber: number;
  title: string;
  weekMaterials: WeekMaterial[];
}

interface Level {
  id: string;
  name: string;
  description: string;
  colorCode: string;
  months: Month[];
}

export default function CurriculumBuilderView() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  useEffect(() => {
    fetchCurriculumData();
  }, []);

  const fetchCurriculumData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
      const token = Cookies.get('auth_token');
      
      const response = await fetch(`${apiUrl}/academic/curriculum-levels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLevels(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed response:", await response.text());
        setLevels([]);
      }
    } catch (error) {
      console.error("Failed to fetch curriculum data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLevel = (id: string) => {
    setExpandedLevels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  const toggleMonth = (id: string) => {
    setExpandedMonths(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white mr-3"></div>
        Memuat Master Kurikulum...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title className="text-xl font-semibold text-slate-900 dark:text-white">Hierarki Kurikulum</Title>
          <Text className="text-slate-500 text-sm">Kelola struktur Level, Bulan, dan Materi Mingguan</Text>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Tambah Level
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {levels.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <BookOpen size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium">Belum ada data kurikulum</p>
            <p className="text-sm">Silakan tambah level baru untuk memulai.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {levels.map(level => (
              <div key={level.id} className="w-full">
                {/* Level Header */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${expandedLevels.includes(level.id) ? 'bg-slate-50 dark:bg-slate-800/20' : ''}`}
                  onClick={() => toggleLevel(level.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${level.colorCode || 'slate'}-100 dark:bg-${level.colorCode || 'slate'}-900/30 text-${level.colorCode || 'slate'}-600 dark:text-${level.colorCode || 'slate'}-400`}>
                       {expandedLevels.includes(level.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{level.name}</h3>
                      <p className="text-xs text-slate-500">{level.description} • {level.months?.length || 0} Bulan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Months Wrapper */}
                {expandedLevels.includes(level.id) && (
                  <div className="bg-slate-50/50 dark:bg-slate-900/50 pl-14 pr-4 py-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                    
                    {level.months && level.months.length > 0 ? [...level.months].sort((a,b) => a.monthNumber - b.monthNumber).map(month => (
                      <div key={month.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        {/* Month Header */}
                        <div 
                          className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          onClick={() => toggleMonth(month.id)}
                        >
                           <div className="flex items-center gap-2">
                              {expandedMonths.includes(month.id) ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                Bulan {month.monthNumber}: {month.title || 'Tanpa Judul'}
                              </span>
                           </div>
                           <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                {month.weekMaterials?.length || 0} Minggu
                              </span>
                              <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Edit2 size={14} />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Trash2 size={14} />
                              </button>
                           </div>
                        </div>

                        {/* Weeks Wrapper */}
                        {expandedMonths.includes(month.id) && (
                          <div className="border-t border-slate-100 dark:border-slate-800">
                            {month.weekMaterials && month.weekMaterials.length > 0 ? (
                               <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs">
                                   <tr>
                                     <th className="px-4 py-3 font-medium">Minggu</th>
                                     <th className="px-4 py-3 font-medium">Kategori Skill</th>
                                     <th className="px-4 py-3 font-medium">Materi Praktek</th>
                                     <th className="px-4 py-3 text-right">Aksi</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                   {[...month.weekMaterials].sort((a,b) => a.weekNumber - b.weekNumber).map(week => (
                                     <tr key={week.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                       <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                         Minggu {week.weekNumber}
                                       </td>
                                       <td className="px-4 py-3">
                                         <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-xs">
                                            {week.category}
                                         </span>
                                       </td>
                                       <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                         {week.materialDescription}
                                       </td>
                                       <td className="px-4 py-3 text-right">
                                         <div className="flex items-center justify-end gap-1">
                                            <button className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors">
                                              <Edit2 size={14} />
                                            </button>
                                            <button className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors">
                                              <Trash2 size={14} />
                                            </button>
                                         </div>
                                       </td>
                                     </tr>
                                   ))}
                                 </tbody>
                               </table>
                            ) : (
                              <div className="p-4 text-center text-sm text-slate-500">
                                Belum ada materi mingguan
                              </div>
                            )}
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                              <button className="w-full flex justify-center items-center gap-2 py-1.5 text-xs font-medium text-blue-600 rounded bg-white dark:bg-slate-800 border-dashed border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <Plus size={14} /> Tambah Materi Minggu
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="p-4 text-center text-sm text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        Belum ada bulan untuk level ini
                      </div>
                    )}
                    
                    <button className="w-full flex justify-center items-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-lg bg-white dark:bg-slate-900 border-dashed border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Plus size={16} /> Tambah Bulan
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
