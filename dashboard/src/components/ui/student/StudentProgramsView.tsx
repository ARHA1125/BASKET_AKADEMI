'use client';

import { useState, useEffect } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common';
import { BookOpen, Calendar, User, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { TrainingClass } from '@/types/training';

export function StudentProgramsView() {
  const [trainingClass, setTrainingClass] = useState<TrainingClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  useEffect(() => {
    fetchTrainingClass();
  }, []);

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
      if (!text || text.trim() === '') {
        console.error('Empty response from server');
        toast.error('Empty response from server');
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
      
      setTrainingClass(data || null);
    } catch (error) {
      console.error('Failed to fetch training class:', error);
      toast.error('Failed to load training program');
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

  if (!trainingClass) {
    return (
      <div className="space-y-6">
        <div>
          <Title>My Training Program</Title>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title>My Training Program</Title>
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

            {trainingClass.coach && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Coach</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{trainingClass.coach.fullName}</p>
                </div>
              </div>
            )}

            {trainingClass.curriculumLevel && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
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

                {trainingClass.activeMonth && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                    <button
                      onClick={() => setExpandedMonth(!expandedMonth)}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="text-left">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          Current Month: {trainingClass.activeMonth.title}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Month {trainingClass.activeMonth.monthNumber}
                        </p>
                      </div>
                      {expandedMonth ? (
                        <ChevronDown className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                      )}
                    </button>

                    {expandedMonth && (
                      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                          View full curriculum details in the Curriculum page
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
            <a
              href="/student/performance"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              View My Performance
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
