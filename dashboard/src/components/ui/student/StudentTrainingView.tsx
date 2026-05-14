'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common';
import { BookOpen, Calendar, User, Loader2, ChevronDown, ChevronRight, Clock, Target, Award } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { TrainingClass, WeekMaterial } from '@/types/training';

const STAT_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  SPD: { icon: '⚡', color: 'text-yellow-500' },
  SHO: { icon: '🎯', color: 'text-red-500' },
  PAS: { icon: '⚽', color: 'text-blue-500' },
  DRI: { icon: '🏃', color: 'text-green-500' },
  DEF: { icon: '🛡️', color: 'text-purple-500' },
  PHY: { icon: '💪', color: 'text-orange-500' },
  CHR: { icon: '🌟', color: 'text-pink-500' },
};

export function StudentTrainingView() {
  const [trainingClass, setTrainingClass] = useState<TrainingClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const fetchTrainingClass = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }
      const response = await fetch(`${apiUrl}/academic/me/training-class`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        if (response.status === 401) {
          toast.error('Please login again');
        } else {
          toast.error('Failed to load training program');
        }
        setTrainingClass(null);
        return;
      }
      
      const text = await response.text();
      if (!text || text.trim() === '' || text.trim() === 'null') {
        setTrainingClass(null);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Response text:', text.substring(0, 200));
        toast.error('Failed to parse response from server');
        setTrainingClass(null);
        return;
      }
      
      setTrainingClass(data);
    } catch (error) {
      console.error('Failed to fetch training class:', error);
      toast.error('Failed to load training program');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingClass();
  }, []);

  const toggleMonth = (monthId: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthId)) {
      newExpanded.delete(monthId);
    } else {
      newExpanded.add(monthId);
    }
    setExpandedMonths(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trainingClass) {
    return (
      <div className="space-y-6">
        <div>
          <Title>My Training</Title>
          <Text className="mt-1">View your training program and curriculum</Text>
        </div>
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <Text>You are not enrolled in any training program</Text>
          <Text className="text-sm mt-2">Contact your coach to join a training class</Text>
        </div>
      </div>
    );
  }

  const totalMonths = trainingClass.curriculumLevel?.months?.length || 6;
  const currentMonth = trainingClass.activeMonth?.monthNumber || 1;
  const progress = (currentMonth / totalMonths) * 100;

  const getWeekStatus = (weekNumber: number, activeMonthNumber: number, currentWeek: number) => {
    if (activeMonthNumber < currentMonth) return 'completed';
    if (activeMonthNumber === currentMonth && weekNumber < currentWeek) return 'completed';
    if (activeMonthNumber === currentMonth && weekNumber === currentWeek) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title>My Training</Title>
          <Text className="mt-1">View your training program and curriculum</Text>
        </div>
        <BookOpen className="w-8 h-8 text-slate-400" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            {trainingClass.name}
          </h3>

          <div className="space-y-4">
            {trainingClass.schedule && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{trainingClass.schedule}</p>
                </div>
              </div>
            )}

            {trainingClass.ageClass && (
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Age Class</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{trainingClass.ageClass}</p>
                </div>
              </div>
            )}

            {trainingClass.coach && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Coach</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{trainingClass.coach.fullName}</p>
                </div>
              </div>
            )}
          </div>

          {trainingClass.curriculumLevel && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Curriculum Level</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{trainingClass.curriculumLevel.name}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Month {currentMonth} of {totalMonths}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {trainingClass.curriculumLevel.months && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Curriculum Timeline</h4>
                  
                  {trainingClass.curriculumLevel.months.map((month) => {
                    const isExpanded = expandedMonths.has(month.id);
                    const isActive = month.monthNumber === currentMonth;
                    
                    return (
                      <div
                        key={month.id}
                        className={`border rounded-lg transition-all ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <button
                          onClick={() => toggleMonth(month.id)}
                          className="w-full flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {month.monthNumber}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {month.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {month.weekMaterials?.length || 0} weeks
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                          )}
                        </button>

                        {isExpanded && month.weekMaterials && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {month.weekMaterials.map((week) => {
                                const status = getWeekStatus(
                                  week.weekNumber,
                                  currentMonth,
                                  trainingClass.activeMonth?.monthNumber || 1
                                );
                                
                                const statusStyles = {
                                  completed: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30',
                                  current: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
                                  upcoming: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
                                };

                                return (
                                  <div
                                    key={week.id}
                                    className={`p-3 rounded-lg border ${statusStyles[status]}`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Week {week.weekNumber}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          status === 'completed'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                            : status === 'current'
                                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        }`}
                                      >
                                        {status === 'completed' ? 'Done' : status === 'current' ? 'Current' : 'Upcoming'}
                                      </span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                      {week.materialDescription}
                                    </p>
                                    
                                    {week.competencyKey && (
                                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <Target className="w-3 h-3" />
                                        <span>{week.competencyKey}</span>
                                      </div>
                                    )}

                                    {week.statDomain && (
                                      <div className="flex items-center gap-1 mt-1 text-xs">
                                        <span className={STAT_ICONS[week.statDomain]?.color || 'text-slate-500'}>
                                          {STAT_ICONS[week.statDomain]?.icon || '📊'}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          {week.statDomain}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
            <a
              href="/student/performance"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Award className="w-4 h-4" />
              View My Performance
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
