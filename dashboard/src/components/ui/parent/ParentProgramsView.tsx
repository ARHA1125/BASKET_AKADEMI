'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common';
import { BookOpen, Calendar, User, Loader2, Users } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { StudentTrainingClassView } from '@/types/training';

export function ParentProgramsView() {
  const [childrenClasses, setChildrenClasses] = useState<StudentTrainingClassView[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  useEffect(() => {
    fetchChildrenClasses();
  }, []);

  const fetchChildrenClasses = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      const response = await fetch(`${apiUrl}/academic/me/children/training-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setChildrenClasses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch children classes:', error);
      toast.error('Gagal memuat program latihan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title>Program Latihan Anak</Title>
          <Text className="mt-1">Lihat program latihan dan kemajuan anak Anda</Text>
        </div>
        <Users className="w-8 h-8 text-slate-400" />
      </div>

      {childrenClasses.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <Text>Anak tidak ditemukan</Text>
        </div>
      ) : (
        <div className="space-y-6">
          {childrenClasses.map((item) => {
            const totalMonths = item.trainingClass?.curriculumLevel?.months?.length || 6;
            const currentMonth = item.trainingClass?.activeMonth?.monthNumber || 1;
            const progress = (currentMonth / totalMonths) * 100;

            return (
              <div
                key={item.student.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {item.student.fullName}
                      </h3>
                      {item.student.ageClass && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Kelas Usia: {item.student.ageClass}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!item.trainingClass ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                      <Text className="text-slate-600 dark:text-slate-400">
                        Tidak terdaftar dalam program latihan apa pun
                      </Text>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                          {item.trainingClass.name}
                        </h4>
                      </div>

                      {item.trainingClass.schedule && (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Jadwal</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.trainingClass.schedule}
                            </p>
                          </div>
                        </div>
                      )}

                      {item.trainingClass.coach && (
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Pelatih</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {item.trainingClass.coach.fullName}
                            </p>
                          </div>
                        </div>
                      )}

                      {item.trainingClass.curriculumLevel && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-3 mb-3">
                            <BookOpen className="w-5 h-5 text-slate-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Tingkat Kurikulum
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {item.trainingClass.curriculumLevel.name}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Kemajuan
                              </span>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Bulan {currentMonth} dari {totalMonths}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {item.trainingClass.activeMonth && (
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                Bulan Aktif: {item.trainingClass.activeMonth.title}
                              </p>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                Bulan {item.trainingClass.activeMonth.monthNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
